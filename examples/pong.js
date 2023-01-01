const COLOR_CODE_WHITE = '#ffffff'; // white color code
const COLOR_CODE_BLACK = '#000000'; // black color code


const PIXEL_SIZE = 4; // size of each cell in pixels
const CANVAS_SIZE = 4096; // size of the canvas in pixels

const Pixoo = require("./pixoo");
//constructor(address, size = 64, debug = false, refreshConnectionAutomatically = true, simulated = false, simulationConfig = new SimulatorConfig()) {
const client = new Pixoo("192.168.1.28", 64, false, true, false);


// Create a 2D array to store the state of each pixel
const pixels = [];
for (let i = 0; i < CANVAS_SIZE; i++) {
    pixels[i] = [];
    for (let j = 0; j < CANVAS_SIZE; j++) {
        pixels[i][j] = 0;
    }
}

// Create the ball object with its initial position and velocity
const ball = {
    x: 32,
    y: 32,
    vx: 3,
    vy: 3
};

// Create the paddles for the two AI players
const paddle1 = {
    x: 0,
    y: 32
};
const paddle2 = {
    x: 63,
    y: 32
};

let score1 = 0; // score for player 1
let score2 = 0; // score for player 2

// Function to update the position of the ball based on its velocity
function updateBall() {
    // Update the position of the ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Check if the ball has collided with a paddle or the wall
    if (ball.x === paddle1.x + 1 && ball.y >= paddle1.y - 4 && ball.y <= paddle1.y + 4) {
        // Ball has collided with paddle 1
        ball.vx = -ball.vx;
    } else if (ball.x === paddle2.x - 1 && ball.y >= paddle2.y - 4 && ball.y <= paddle2.y + 4) {
        // Ball has collided with paddle 2
        ball.vx = -ball.vx;
    } else if (ball.y === 0 || ball.y >= 63) {
        // Ball has collided with the top or bottom wall
        ball.vy = -ball.vy;
    } else if (ball.x <= 0) {
        // Ball has gone off the left side of the screen
        score2++;
        resetBall();
    } else if (ball.x >= 63) {
        // Ball has gone off the right side of the screen
        score1++;
        resetBall();
    }
}

// Function to reset the ball to the center of the screen
function resetBall() {
    ball.x = 32;
    ball.y = 32;
    ball.vx = 3;
    ball.vy = 3;
}

// Function to update the position of the paddles based on the position of the ball
function updatePaddles() {
    // Make paddle 1 smarter by predicting the future position of the ball
    const ballVelocity = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    // Calculate the number of frames it will take for the ball to reach the paddle
    const framesToReachPaddle = paddle1.x / ballVelocity;
    // Calculate the future position of the ball based on its velocity and the number of frames
    const futureBallY = ball.y + framesToReachPaddle * ball.vy;
    // Adjust the position of the paddle based on the future position of the ball
    if (futureBallY < paddle1.y + 4) {
        paddle1.y--;
    } else if (futureBallY > paddle1.y + 4) {
        paddle1.y++;
    }
    if (Math.abs(futureBallY - paddle1.y) > 8) {
        paddle1.y += (futureBallY > paddle1.y ? 1 : -1) * 8;
    }
    // Restrict the y position of paddle 1 to a maximum value of 64
    paddle1.y = Math.min(paddle1.y, 64);

    // Update the position of paddle 2 based on the position of the ball
    if (ball.y < paddle2.y + 4) {
        paddle2.y--;
    } else if (ball.y > paddle2.y + 4) {
        paddle2.y++;
    }
    if (Math.abs(ball.y - paddle2.y) > 8) {
        paddle2.y += (ball.y > paddle2.y ? 1 : -1) * 8;
    }

    // Make paddle 2 smarter by predicting the future position of the ball
    // Calculate the number of frames it will take for the ball to reach the paddle
    const framesToReachPaddle2 = (CANVAS_SIZE - paddle2.x - 1) / ballVelocity;
    // Calculate the future position of the ball based on its velocity and the number of frames
    const futureBallY2 = ball.y + framesToReachPaddle2 * ball.vy;
    // Adjust the position of the paddle based on the future position of the ball
    if (futureBallY2 < paddle2.y + 4) {
        paddle2.y--;
    } else if (futureBallY2 > paddle2.y + 4) {
        paddle2.y++;
    }
    if (Math.abs(futureBallY2 - paddle2.y) > 8) {
        paddle2.y += (futureBallY2 > paddle2.y ? 1 : -1) * 8;
    }
    // Restrict the y position of paddle 2 to a maximum value of 64
    paddle2.y = Math.min(paddle2.y, 64);
}


// Function to draw the pixels on the canvas
function drawPixels() {
    // Clear the canvas
    client.clear();

    console.log("Ball", ball.x, ball.y, ball.x + PIXEL_SIZE, ball.y + PIXEL_SIZE)
    console.log(paddle2)
    // Draw the ball
    client.drawFilledRectangleFromTopLeftToBottomRightRgb(ball.x, ball.y, ball.x + PIXEL_SIZE, ball.y + PIXEL_SIZE, 255, 255, 255);
    // Draw the paddles
    client.drawFilledRectangleFromTopLeftToBottomRightRgb(paddle1.x, paddle1.y - 4, paddle1.x + 1, paddle1.y + 4, 255, 255, 255);
    client.drawFilledRectangleFromTopLeftToBottomRightRgb(paddle2.x, paddle2.y - 4, paddle2.x + 1, paddle2.y + 4, 255, 255, 255);

    // Draw the scores
    client.drawText(score1.toString(), [8, 2], [255, 255, 255]);
    client.drawText(score2.toString(), [56, 2], [255, 255, 255]);
}

// Function to run the game loop
function gameLoop() {
    // Update the position of the ball and paddles
    updateBall();
    updatePaddles();

    // Draw the pixels on the canvas
    drawPixels();

    // Schedule the next game loop iteration
    setTimeout(gameLoop, 300);
}

function update() {
    client.push().then(() => {
        update();
    })
}

// Start the game loop
gameLoop();
update();
