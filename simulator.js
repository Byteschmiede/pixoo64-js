const { createCanvas, Image, createImageData } = require('canvas');
const { Palette } = require('./_colors');
const fs = require("fs");

class SimulatorConfig {
    constructor(scale = 4) {
        this.scale = scale;
    }
}

class Simulator {
    __config = null;
    __canvas = null;
    __context = null;
    __image_size = [64, 64];
    __screen_size = [64, 64];


    constructor(pixoo, config) {
        this.__config = config;
        const scale = this.__config.scale;
        this.__image_size = [pixoo.size * scale, pixoo.size * scale];

        this.__canvas = createCanvas(pixoo.size, pixoo.size);
        this.__context = this.__canvas.getContext('2d');

        // Scale it up to something useful
        const image = new Image();
        image.src = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        image.width = pixoo.size;
        image.height = pixoo.size;
        this.counter = 0;

        // Create somewhat of a loading screen
        this.__context.fillStyle = 'black';
        this.__context.fillRect(0, 0, this.__image_size[0], this.__image_size[1]);
        this.__context.fillStyle = "white";
        this.__context.font = '16px sans-serif';
        this.__context.fillText('waiting', 12, 14);
        this.__context.fillText('for', 23, 26);
        this.__context.fillText('buffer', 2, 38);
    }

    async display(buffer, counter) {
        // Convert our buffer to a nice image

        fs.writeFileSync("buffer.txt",JSON.stringify(buffer))        
        const rgbaData = buffer.map(pixel => {
            if(typeof pixel[Symbol.iterator] !== 'function') {
                return [0,0,0,255];
            } else {
                return [...pixel, 255]
            }
        }
        );

        const flatData = rgbaData.flat();

        console.log("Pixels: ", flatData.length / 4)

        const imageData = createImageData(new Uint8ClampedArray(flatData), this.__screen_size[0], this.__screen_size[1])
        this.__context.putImageData(imageData, 0, 0);

    }

    getImage() {
        return this.__canvas.toDataURL();
    }

    saveImage(filePath) {
        const data = this.getImage().split(',')[1];
        const buffer = Buffer.from(data, 'base64');

        fs.writeFileSync(filePath, buffer);
    }


}


module.exports = { Simulator, SimulatorConfig };