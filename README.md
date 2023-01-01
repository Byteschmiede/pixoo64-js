
# 🚀 Pixoo - A Node.js library for the PIXOO LED matrix

Pixoo is a powerful Node.js library for controlling the PIXOO LED matrix over HTTP. With Pixoo, you can easily draw pixels, text, and even images on the matrix with a simple and intuitive API.

## 📦 Installation

To install Pixoo, simply use npm:

`npm install pixoo64` 

## 🔨 Usage

To use Pixoo, you'll need to know the IP address of your PIXOO matrix. Once you have that, you can create a new Pixoo instance like so:

    const Pixoo = require('pixoo');
    const pixoo = new Pixoo('192.168.1.100');

From there, you can start using the various functions provided by Pixoo to draw on the matrix. For example, you can clear the matrix and draw a pixel like this:

    pixoo.clear();
    pixoo.drawPixel([0, 0], [255, 0, 0]); // Draw a red pixel at (0, 0)

There are many more functions available, including ones for drawing text and images. 

## 🤖 Simulation mode

Pixoo can also be used in simulation mode, which allows you to test and debug your code without the need for a physical PIXOO matrix. To use simulation mode, simply pass `true` as the second argument to the Pixoo constructor:

    const  client = new  Pixoo("127.0.0.1", 64, true, true, true);
  

    (async () => {
	    await  client.drawImage(__dirname + "/background.png")
	    client.drawText("Hello World", [23, 4], [128, 255, 255])

	    await  client.push();
	    console.log("Saving sim...")
	    const  outputPath = "sim.png";
	    client.simulator.saveImage(outputPath)
    })()

In simulation mode, a virtual matrix will be displayed on a png.

## Examples

Go checkout the examples folder. There are several examples like pong, snake and conways game of life. 


## 🚀 Contributing

We welcome contributions to Pixoo! If you have an idea for a new feature or have found a bug, please open an issue. If you'd like to contribute code, please fork the repository and open a pull request.