const base64 = require('base64-js');
const fs = require('fs');
const sharp = require('sharp');
const request = require('request-promise-native');

const Palette = require('./_colors');
const retrieveGlyph = require('./_font').retrieveGlyph;
const Simulator = require('./simulator').Simulator;
const SimulatorConfig = require('./simulator').SimulatorConfig;

function clamp(value, minimum = 0, maximum = 255) {
    if (value > maximum) {
        return maximum;
    }
    if (value < minimum) {
        return minimum;
    }

    return value;
}

function clampColor(rgb) {
    let c = [clamp(rgb[0]), clamp(rgb[1]), clamp(rgb[2])];
    return c;
}

function lerp(start, end, interpolant) {
    return start + interpolant * (end - start);
}

function lerpLocation(xy1, xy2, interpolant) {
    return [lerp(xy1[0], xy2[0], interpolant), lerp(xy1[1], xy2[1], interpolant)];
}

function minimumAmountOfSteps(xy1, xy2) {
    return Math.max(Math.abs(xy1[0] - xy2[0]), Math.abs(xy1[1] - xy2[1]));
}

function rgbToHexColor(rgb) {
    return `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
}

function roundLocation(xy) {
    return Math.round(xy[0]), Math.round(xy[1]);
}



class TextScrollDirection {
    static get LEFT() { return 0; }
    static get RIGHT() { return 1; }
}

class Pixoo {
    constructor(address, size = 64, debug = false, refreshConnectionAutomatically = true, simulated = false, simulationConfig = new SimulatorConfig()) {
        if (![16, 32, 64].includes(size)) {
            throw new Error('Invalid screen size in pixels given. Valid options are 16, 32, and 64');
        }

        this.refreshConnectionAutomatically = refreshConnectionAutomatically;
        this.address = address;
        this.debug = debug;

        this.size = size;
        this.simulated = simulated;

        // Total number of pixels
        this.pixelCount = this.size * this.size;

        // Generate URL
        this.url = `http://${address}/post`;

        // Prefill the buffer
        this.fill();


        // We're going to need a simulator
        if (this.simulated) {
            this.simulator = new Simulator(this, simulationConfig);
        }

        // Retrieve the counter
        this.loadCounter();
        // Resetting if needed
        if (this.refreshConnectionAutomatically && this.counter > this.refreshCounterLimit) {
            this.resetCounter();
        }
    }

    clear(rgb = Palette.COLOR_BLACK) {
        this.fill(rgb);
    }

    clearRgb(r, g, b) {
        this.fillRgb(r, g, b);
    }

    drawCharacter(character, xy = [0, 0], rgb = Palette.WHITE) {
        const matrix = retrieveGlyph(character);
        if (matrix) {
            for (let index = 0; index < matrix.length; index += 1) {
                if (matrix[index] === 1) {
                    const localX = index % 3;
                    const localY = Math.floor(index / 3);
                    this.drawPixel([xy[0] + localX, xy[1] + localY], rgb);
                }
            }
        }
    }

    drawCharacterAtLocationRgb(character, x = 0, y = 0, r = 255, g = 255, b = 255) {
        this.drawCharacter(character, [x, y], [r, g, b]);
    }

    drawFilledRectangle(start, stop, rgb = Palette.WHITE) {
        for (let x = start[0]; x < stop[0]; x += 1) {
            for (let y = start[1]; y < stop[1]; y += 1) {
                this.drawPixel([x, y], rgb);
            }
        }
    }

    drawFilledRectangleFromTopLeftToBottomRightRgb(x1, y1, x2, y2, r, g, b) {
        this.drawFilledRectangle([x1, y1], [x2, y2], [r, g, b]);
    }

    async drawImage(path, location = [0, 0]) {
        return new Promise(async (resolve, reject) => {


            // Read the image file
            const image = await sharp(path).metadata();
            let { width, height } = image;

            // Calculate the ratio to scale the image if needed
            let ratio = 1;
            if (width > this.size , height > this.size) {
                ratio = Math.min(this.size / width, this.size / height);
            }

            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);

            console.log(width, height)
            // Load the image and resize it if needed
            let pipeline = sharp(path).resize(width, height);
            // Crop the image if needed
            if (location[0] < 0 || location[1] < 0 || location[0] + width > this.size || location[1] + height > this.size) {
                pipeline = pipeline.extract({
                    left: location[0] < 0 ? -location[0] : 0,
                    top: location[1] < 0 ? -location[1] : 0,
                    width: location[0] + width > this.size ? this.size - location[0] : width,
                    height: location[1] + height > this.size ? this.size - location[1] : height,
                });
            }

            // Iterate through the pixels in the image
            pipeline.raw().toBuffer((err, data, info) => {
                if (err) {
                    throw err;
                }

                // Loop through the pixel data
                for (let x = 0; x < info.width; x += 1) {
                    for (let y = 0; y < info.height; y += 1) {
                        // Calculate the index of the current pixel in the data buffer
                        const index = (y * info.width + x) * info.channels;
                        // Extract the RGB values of the pixel
                        const r = data[index];
                        const g = data[index + 1];
                        const b = data[index + 2];
                        // Draw the pixel on the display
                        this.drawPixel([x + location[0], y + location[1]], [r, g, b]);
                    }
                }
                resolve();
            });
        })
    }


    drawImageAtLocation(path, x, y) {
        this.drawImage(path, [x, y]);
    }

    drawLine(start, stop, rgb = Palette.WHITE) {
        const length = minimumAmountOfSteps(start, stop);
        for (let i = 0; i <= length; i += 1) {
            const interpolant = i / length;
            this.drawPixel(roundLocation(lerpLocation(start, stop, interpolant)), rgb);
        }
    }
    drawPixel(xy, rgb = Palette.WHITE) {
        if (xy[0] >= 0 && xy[0] < this.size && xy[1] >= 0 && xy[1] < this.size) {
            this.buffer[xy[0] + (xy[1] * this.size)] = clampColor(rgb);
        }
    }

    drawPixelAtIndex(index, rgb = Palette.WHITE) {
        this.drawPixel(this.indexToXY(index), rgb);
    }

    drawPixelAtIndexRgb(index, r, g, b) {
        this.drawPixelAtIndex(index, [r, g, b]);
    }

    drawPixelAtLocationRgb(x, y, r, g, b) {
        this.drawPixel([x, y], [r, g, b]);
    }

    drawText(text, xy = [0, 0], rgb = Palette.WHITE) {
        for (let i = 0; i < text.length; i += 1) {
            this.drawCharacter(text[i], [xy[0] + (i * 4), xy[1]], rgb);
        }
    }

    drawTextAtLocationRgb(text, x = 0, y = 0, r = 255, g = 255, b = 255) {
        this.drawText(text, [x, y], [r, g, b]);
    }

    fill(rgb = Palette.COLOR_BLACK) {
        this.buffer = new Array(this.pixelCount).fill(rgb);
    }

    fillRgb(r, g, b) {
        this.fill([r, g, b]);
    }

    indexToXY(index) {
        return [index % this.size, Math.floor(index / this.size)];
    }

    loadCounter() {
        this.counter = this.simulated ? this.simulator.counter : parseInt(request.get(`http://${this.address}/getCounter`).text, 10);
    }

    async push() {
        await this.sendBuffer();
    }

    resetCounter() {
        this.counter = 0;
        this.buffersSend = 0;
        if (!this.simulated) {
            request.get(`http://${this.address}/resetCounter`);
        }
    }

    sendText(channel, text, direction = TextScrollDirection.LEFT, speed = 1, rgb = Palette.WHITE, align = 'left') {
        if (!this.simulated) {
            request.post(this.url, json = ({
                text,
                channel: channel.value,
                direction: direction.value,
                speed,
                color: rgbToHexColor(rgb),
                align,
            }));
        }
    }
    async sendBuffer() {
        // Add to the internal counter
        this.counter = this.counter + 1;

        // Check if we've passed the limit and reset the counter for the animation remotely
        if (this.refresh_connection_automatically && this.counter >= this.__refresh_counter_limit) {
            this.__resetCounter();
            this.counter = 1;
        }

        if (this.debug) {
        }

        // If it's simulated, we don't need to actually push it to the divoom
        if (this.simulated) {
            await this.simulator.display(this.buffer, this.counter);

            // Simulate this too I suppose
            this.buffers_send = this.buffers_send + 1;
            return;
        }

        // Encode the buffer to base64 encoding
        request.post({
            url: this.url,
            json: true,
            body: {
                Command: 'Draw/SendHttpGif',
                PicNum: 1,
                PicWidth: this.size,
                PicOffset: 0,
                PicID: this.counter,
                PicSpeed: 1000,
                PicData: base64.fromByteArray(new Uint8Array(this.buffer)).toString(),
            },
        }, (error, response, data) => {
            if (data.error_code !== 0) {
                this.__error(data);
            } else {
                this.buffers_send = this.buffers_send + 1;

                if (this.debug) {
                }
            }
        });
    }
}

module.exports = Pixoo;