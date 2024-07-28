let cols, rows;
let damping = 0.99;
let waveCurrent, wavePrevious;

// Ball parameters
let ballX, ballY, ballRadius;

function initializeWave() {
    const randomX = Math.floor(Math.random() * cols);
    const randomY = Math.floor(Math.random() * rows);
    wavePrevious[randomX + randomY * cols] = 1000; // Initial disturbance
}

function isInBall(x, y) {
    const dx = x - ballX;
    const dy = y - ballY;
    return dx * dx + dy * dy <= ballRadius * ballRadius;
}

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

function drawWave() {
    const imageData = new Uint8ClampedArray(cols * rows * 4);
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const idx = x + y * cols;
            const brightness = Math.max(0, Math.min(255, Math.floor(waveCurrent[idx] * 255)));
            const pixelIndex = (x + y * cols) * 4;
            if (isInBall(x, y)) {
                imageData[pixelIndex] = 0;
                imageData[pixelIndex + 1] = 0;
                imageData[pixelIndex + 2] = 0;
            } else {
                imageData[pixelIndex] = brightness;
                imageData[pixelIndex + 1] = brightness;
                imageData[pixelIndex + 2] = 255;
            }
            imageData[pixelIndex + 3] = 255; // Alpha channel
        }
    }
    return imageData;
}

onmessage = function(e) {
    switch (e.data.type) {
        case 'resize':
            cols = e.data.cols;
            rows = e.data.rows;
            waveCurrent = new Float32Array(cols * rows).fill(0);
            wavePrevious = new Float32Array(cols * rows).fill(0);
            ballX = Math.floor(cols / 2);
            ballY = Math.floor(rows / 2);
            ballRadius = Math.floor(cols / 10);
            break;
        case 'initialize':
            initializeWave();
            setInterval(initializeWave, 20000); // Start a new wavefront every 7 seconds
            break;
        case 'update':
            updateWave();
            const imageData = drawWave();
            postMessage({
                type: 'draw',
                imageData: imageData,
                width: cols,
                height: rows
            });
            break;
    }
};

