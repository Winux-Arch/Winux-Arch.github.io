window.onload = function() {
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function init() {
        resizeCanvas();
        createParticles();
        animate();
        window.addEventListener('resize', resizeCanvas);
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                angle: Math.random() * Math.PI * 2,
                angularSpeed: (Math.random() - 0.5) * 0.05,
                trail: []
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        drawParticles();
        updateParticles();
        requestAnimationFrame(animate);
    }

    function drawParticles() {
        particles.forEach(p => {
            // Draw the particle
            ctx.fillStyle = '#64b5f6';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Draw the trail
            ctx.strokeStyle = 'rgba(100, 181, 246, 0.3)';
            ctx.lineWidth = p.size;
            ctx.beginPath();
            for (let i = 0; i < p.trail.length - 1; i++) {
                ctx.moveTo(p.trail[i].x, p.trail[i].y);
                ctx.lineTo(p.trail[i + 1].x, p.trail[i + 1].y);
            }
            ctx.stroke();
        });
    }

    function updateParticles() {
        particles.forEach(p => {
            p.angle += p.angularSpeed;
            p.x += Math.sin(p.angle) * 2;
            p.y += Math.cos(p.angle) * 2;

            // Update the trail
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 10) {
                p.trail.shift();
            }

            // Bounce off the edges
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            // Ensure particles stay within the canvas bounds
            if (p.x < 0) p.x = 0;
            if (p.x > width) p.x = width;
            if (p.y < 0) p.y = 0;
            if (p.y > height) p.y = height;
        });
    }

    init();
};


