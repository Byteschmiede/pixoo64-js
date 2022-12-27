const Pixoo = require("./pixoo");
//constructor(address, size = 64, debug = false, refreshConnectionAutomatically = true, simulated = false, simulationConfig = new SimulatorConfig()) {
const client = new Pixoo("127.0.0.1", 64, true, true, true);


(async () => {


    await client.drawImage(__dirname + "/background.png")
    client.drawText("Prime", [23, 4], [128, 255, 255])
    client.drawText("0002", [24, 13], [255, 255, 255])
    
    client.drawText("Amzn", [7, 23], [255, 190, 128])
    client.drawText("0002", [8, 32], [255, 255, 255])
    
    client.drawText("Etsy", [8, 44], [255, 150, 100])
    client.drawText("0002", [8, 53], [255, 255, 255])
    
    
    client.drawText("ACS", [43, 44], [10, 255, 255])
    client.drawText("0002", [40, 53], [255, 255, 255])
    
    client.drawText("Shop", [40, 23], [128, 255, 100])
    client.drawText("0002", [40, 32], [255, 255, 255])
    
    
    await client.push();
    console.log("Saving sim...")
    const outputPath = "sim.png";
    client.simulator.saveImage(outputPath)
})()
