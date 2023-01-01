const CELL_SIZE = 1; // size of each cell in pixels
const CANVAS_SIZE = 4096; // size of the canvas in pixels
const COLOR_CODE_WHITE = '#ffffff'; // white color code
const COLOR_CODE_BLACK = '#000000'; // black color code
const COLOR_CODE_RED = '#ff0000'; // red color code

const Pixoo = require("./pixoo");
//constructor(address, size = 64, debug = false, refreshConnectionAutomatically = true, simulated = false, simulationConfig = new SimulatorConfig()) {
const client = new Pixoo("192.168.1.28", 64, true, true, false);


// Create a 2D array to store the state of each cell
var cells = [];
for (let i = 0; i < CANVAS_SIZE / CELL_SIZE; i++) {
  cells[i] = [];
  for (let j = 0; j < CANVAS_SIZE / CELL_SIZE; j++) {
    // Initialize each cell with a random state (alive or dead)
    cells[i][j] = Math.random() > 0.5;
  }
}

let generation = 0; // current generation

// Function to update the state of the cells based on the Conways Game of Life rules
function updateCells() {
  // Create a new 2D array to store the updated state of each cell
  const updatedCells = [];
  for (let i = 0; i < cells.length; i++) {
    updatedCells[i] = [];
    for (let j = 0; j < cells[i].length; j++) {
      // Get the number of alive neighbors for the current cell
      const aliveNeighbors = countAliveNeighbors(i, j);

      // Apply the Conways Game of Life rules to determine the updated state of the cell
      if (cells[i][j]) {
        // Cell is currently alive
        updatedCells[i][j] = aliveNeighbors === 2 || aliveNeighbors === 3;
      } else {
        // Cell is currently dead
        updatedCells[i][j] = aliveNeighbors === 3;
      }
    }
  }

  // Update the cells with the new state
  cells = updatedCells;
  generation++;
}

// Function to count the number of alive neighbors for a given cell
function countAliveNeighbors(x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // Don't count the current cell itself
      if (i === 0 && j === 0) {
        continue;
      }

      // Check if the neighbor is within the bounds of the grid
      if (x + i >= 0 && x + i < cells.length && y + j >= 0 && y + j < cells[x].length) {
        if (cells[x + i][y + j]) {
          count++;
        }
      }
    }
  }
  return count;
}

// Function to draw the cells on the canvas
function drawCells() {
    // Clear the canvas
    client.clear();
  
    // Draw each cell
    for (let i = 0; i < cells.length; i++) {
      for (let j = 0; j < cells[i].length; j++) {
        // Determine the color of the cell based on its state and generation
        let colorCode;
        if (cells[i][j]) {
          // Cell is alive
          const intensity = Math.floor(255 * generation / 20);
          colorCode = [255-intensity, 255, 255];
        } else {
          // Cell is dead
          colorCode = [0,0,0];
        }
  
        // Draw the cell
        client.drawFilledRectangleFromTopLeftToBottomRightRgb(i * CELL_SIZE, j * CELL_SIZE, i * CELL_SIZE+CELL_SIZE, j * CELL_SIZE+CELL_SIZE, colorCode[0],colorCode[1],colorCode[2]);
      }
    }
  }
  
  // Function to run the game loop
  function gameLoop() {
    // Update the state of the cells
    updateCells();
  
    // Draw the cells on the canvas
    drawCells();
    client.drawText("Gen "+ generation, [2, 2], [0,255,0])
    // Schedule the next game loop iteration
    client.push().then(() => {
        setTimeout(gameLoop, 300);
    })
  }
  
  // Start the game loop
  gameLoop();
  