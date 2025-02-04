const canvas = document.getElementById('backgroundCanvas');

const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Helper function to resize canvas on window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Generate multiple sets of random points
const createPointSet = (count, offsetX = 0, offsetY = 0) => {
    return Array.from({
        length: count
    }, () => ({
        x: Math.random() * canvas.width / 3 + offsetX,
        y: Math.random() * canvas.height / 3 + offsetY,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
    }));
};

const pointSets = [
    createPointSet(10, 0, 0),
    createPointSet(10, canvas.width / 3, 0),
    createPointSet(10, (2 * canvas.width) / 3, canvas.height / 3),
    createPointSet(10, 0, (2 * canvas.height) / 3),
    createPointSet(10, (2 * canvas.width) / 3, (2 * canvas.height) / 3)
];

// Compute the convex hull using Graham's scan algorithm
function computeConvexHull(points) {
    // Sort points by x-coordinate (and y-coordinate as a tiebreaker)
    points.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);

    const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

    const lower = [];
    for (const p of points) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
            lower.pop();
        }
        lower.push(p);
    }

    const upper = [];
    for (const p of points.slice().reverse()) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
            upper.pop();
        }
        upper.push(p);
    }

    // Remove the last point of each half because it's repeated
    upper.pop();
    lower.pop();

    return lower.concat(upper);
}



// Animate the points and convex hulls
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update points with smooth motion
    pointSets.forEach(points => {
        points.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Reverse velocity if points hit the canvas boundary
            if (p.x <= 0 || p.x >= canvas.width) p.vx *= -1;
            if (p.y <= 0 || p.y >= canvas.height) p.vy *= -1;
        });
    });

    // Compute convex hulls for each set
    const hulls = pointSets.map(points => computeConvexHull(points));

    // Draw points and hulls
    const colors = ['rgba(0, 150, 255, 0.8)', 'rgba(0, 255, 150, 0.8)', 'rgba(255, 100, 100, 0.8)', 'rgba(255, 255, 0, 0.8)', 'rgba(150, 100, 255, 0.8)'];

    pointSets.forEach((points, index) => {
        // Draw points
        ctx.fillStyle = colors[index % colors.length];
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw convex hull
        const hull = hulls[index];
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < hull.length; i++) {
            const p = hull[i];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.stroke();
    });

    requestAnimationFrame(animate);
}

animate();