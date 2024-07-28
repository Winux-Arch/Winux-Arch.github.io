// Set up the canvas and context
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

// Create an offscreen canvas for the wave simulation
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    offscreenCanvas.width = Math.floor(canvas.width / 4);
    offscreenCanvas.height = Math.floor(canvas.height / 4);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Wave parameters
const cols = offscreenCanvas.width;
const rows = offscreenCanvas.height;
const damping = 0.99;

// Ball parameters
const ballX = Math.floor(cols / 2);
const ballY = Math.floor(rows / 2);
const ballRadius = Math.floor(cols / 10);

// Create the grids
let waveCurrent = new Float32Array(cols * rows).fill(0);
let wavePrevious = new Float32Array(cols * rows).fill(0);

// Function to initialize the wave with a single disturbance at a random location
function initializeWave() {
    const randomX = Math.floor(Math.random() * cols);
    const randomY = Math.floor(Math.random() * rows);
    wavePrevious[randomX + randomY * cols] = 1000; // Initial disturbance
}

// Function to check if a point is inside the ball
function isInBall(x, y) {
    const dx = x - ballX;
    const dy = y - ballY;
    return dx * dx + dy * dy <= ballRadius * ballRadius;
}

// Function to update the wave based on the PDE
function updateWave() {
    for (let x = 1; x < cols - 1; x++) {
        for (let y = 1; y < rows - 1; y++) {
            if (!isInBall(x, y)) {
                const idx = x + y * cols;
                waveCurrent[idx] = (
                    wavePrevious[(x - 1) + y * cols] +
                    wavePrevious[(x + 1) + y * cols] +
                    wavePrevious[x + (y - 1) * cols] +
                    wavePrevious[x + (y + 1) * cols]
                ) / 2 - waveCurrent[idx];
                waveCurrent[idx] *= damping;
            } else {
                waveCurrent[x + y * cols] = 0;
            }
        }
    }

    // Swap buffers
    let temp = wavePrevious;
    wavePrevious = waveCurrent;
    waveCurrent = temp;
}

// Function to draw the wave
function drawWave() {
    const imageData = offscreenCtx.createImageData(cols, rows);
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const idx = x + y * cols;
            const brightness = Math.max(0, Math.min(255, Math.floor(waveCurrent[idx] * 255)));
            const pixelIndex = (x + y * cols) * 4;
            if (isInBall(x, y)) {
                imageData.data[pixelIndex] = 0;
                imageData.data[pixelIndex + 1] = 0;
                imageData.data[pixelIndex + 2] = 0;
            } else {
                imageData.data[pixelIndex] = brightness;
                imageData.data[pixelIndex + 1] = brightness;
                imageData.data[pixelIndex + 2] = 255;
            }
            imageData.data[pixelIndex + 3] = 255; // Alpha channel
        }
    }
    offscreenCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
}

// Animation loop
function animate() {
    updateWave();
    drawWave();
    requestAnimationFrame(animate);
}

// Initialize and start the animation
initializeWave();
setInterval(initializeWave, 7000); // Start a new wavefront every 7 seconds
animate();

