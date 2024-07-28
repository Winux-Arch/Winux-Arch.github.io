// Set up the canvas and context
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

// Create an offscreen canvas for the wave simulation
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');

// Create a Web Worker
const worker = new Worker('worker.js');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    offscreenCanvas.width = Math.floor(canvas.width / 4);
    offscreenCanvas.height = Math.floor(canvas.height / 4);

    // Send canvas size to worker
    worker.postMessage({ type: 'resize', cols: offscreenCanvas.width, rows: offscreenCanvas.height });
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Function to draw the wave
function drawWave(imageData) {
    offscreenCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
}

// Animation loop
function animate() {
    worker.postMessage({ type: 'update' });
    requestAnimationFrame(animate);
}

// Handle messages from the worker
worker.onmessage = function(e) {
    if (e.data.type === 'draw') {
        drawWave(new ImageData(new Uint8ClampedArray(e.data.imageData), e.data.width, e.data.height));
    }
};

// Initialize and start the animation
worker.postMessage({ type: 'initialize' });
animate();


