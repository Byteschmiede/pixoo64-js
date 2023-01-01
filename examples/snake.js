const PIXEL_SIZE = 1; // size of each cell in pixels
const CANVAS_SIZE = 64; // size of the canvas in pixels

const Pixoo = require("../pixoo");
//constructor(address, size = 64, debug = false, refreshConnectionAutomatically = true, simulated = false, simulationConfig = new SimulatorConfig()) {
const client = new Pixoo("192.168.1.28", 64, false, true, false);
let snake = [{ x: 32, y: 32 }];
// Initialize game state
let foods = [
    { x: Math.floor(Math.random() * CANVAS_SIZE), y: Math.floor(Math.random() * CANVAS_SIZE) },
    { x: Math.floor(Math.random() * CANVAS_SIZE), y: Math.floor(Math.random() * CANVAS_SIZE) },
    { x: Math.floor(Math.random() * CANVAS_SIZE), y: Math.floor(Math.random() * CANVAS_SIZE) },
    { x: Math.floor(Math.random() * CANVAS_SIZE), y: Math.floor(Math.random() * CANVAS_SIZE) },
    { x: Math.floor(Math.random() * CANVAS_SIZE), y: Math.floor(Math.random() * CANVAS_SIZE) },
    { x: Math.floor(Math.random() * CANVAS_SIZE), y: Math.floor(Math.random() * CANVAS_SIZE) }
];


let direction = 'right';
// Function to update the game state
function update() {
    // Move the snake in the current direction
    let head = snake[0];
    let newHead;
    if (direction === 'up') {
        newHead = { x: head.x, y: head.y - PIXEL_SIZE };
    } else if (direction === 'down') {
        newHead = { x: head.x, y: head.y + PIXEL_SIZE };
    } else if (direction === 'left') {
        newHead = { x: head.x - PIXEL_SIZE, y: head.y };
    } else if (direction === 'right') {
        newHead = { x: head.x + PIXEL_SIZE, y: head.y };
    }

    // Check if the new head position collides with the snake's body
    for (const segment of snake) {
        if (segment.x === newHead.x && segment.y === newHead.y) {
            // Choose a new direction that avoids the collision
            if (direction === 'up' || direction === 'down') {
                direction = Math.random() < 0.5 ? 'left' : 'right';
            } else {
                direction = Math.random() < 0.5 ? 'up' : 'down';
            }
        }
    }

    // Check if the new head position collides with the snake's body
    for (const segment of snake) {
        if (segment.x === newHead.x && segment.y === newHead.y) {
            // Cut off the snake if it collides with itself
            let index = snake.indexOf(segment);
            snake = snake.slice(0, index);
            return;
        }
    }

    // Update the position of the head and add a new segment to the snake
    snake.unshift(newHead);
    head = newHead;
    let foodEaten = false;
    for (let i = 0; i < foods.length; i++) {
        if (newHead.x === foods[i].x && newHead.y === foods[i].y) {
            // Snake has eaten food, remove it from the list and generate a new food
            foods.splice(i, 1);
            foods.push({ x: Math.floor(Math.random() * CANVAS_SIZE), y: Math.floor(Math.random() * CANVAS_SIZE) });
            foodEaten = true;
            break;
        }
    }
    if (!foodEaten) {
        // Snake has not eaten food, remove last element of the snake
        snake.pop();
    }

    // Update the direction of the snake based on the position of the nearest food
    let closestFood = foods[0];
    let minDistance = Math.abs(foods[0].x - head.x) + Math.abs(foods[0].y - head.y);
    for (const food of foods) {
        const distance = Math.abs(food.x - head.x) + Math.abs(food.y - head.y);
        if (distance < minDistance) {
            closestFood = food;
            minDistance = distance;
        }
    }
    if (closestFood.x > head.x && direction !== 'left') {
        direction = 'right';
    } else if (closestFood.x < head.x && direction !== 'right') {
        direction = 'left';
    } else if (closestFood.y < head.y && direction !== 'down') {
        direction = 'up';
    } else if (closestFood.y > head.y && direction !== 'up') {
        direction = 'down';
    }
}
function draw() {
    // Clear the canvas
    client.clear();

    // Draw the snake
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const color = getRainbowColor(i / snake.length);
        client.drawFilledRectangleFromTopLeftToBottomRightRgb(
            segment.x,
            segment.y,
            segment.x + PIXEL_SIZE,
            segment.y + PIXEL_SIZE,
            color[0],
            color[1],
            color[2]
        );
    }

    // Draw the food
    for (const food of foods) {
        client.drawFilledRectangleFromTopLeftToBottomRightRgb(
            food.x,
            food.y,
            food.x + PIXEL_SIZE,
            food.y + PIXEL_SIZE,
            255,
            0,
            0
        );
    }
}
// Function to get a rainbow color based on a value in the range [0, 1]
function getRainbowColor(value) {
    const hue = Math.round(360 * value);
    const h = hue / 60;
    const c = 255;
    const x = c * (1 - Math.abs((h % 2) - 1));

    let r, g, b;
    if (h < 1) {
        r = c;
        g = x;
        b = 0;
    } else if (h < 2) {
        r = x;
        g = c;
        b = 0;
    } else if (h < 3) {
        r = 0;
        g = c;
        b = x;
    } else if (h < 4) {
        r = 0;
        g = x;
        b = c;
    } else if (h < 5) {
        r = x;
        g = 0;
        b = c;
    } else {
        r = c;
        g = 0;
        b = x;
    }

    return [r, g, b];
}

// Function to run the game loop
function gameLoop() {
    update();
    draw();

    // Schedule the next game loop iteration
    setTimeout(gameLoop, 100);
}

function updatePixoo() {
    client.push().then(() => {
        updatePixoo();
    })
}

// Start the game loop
gameLoop();
updatePixoo();
