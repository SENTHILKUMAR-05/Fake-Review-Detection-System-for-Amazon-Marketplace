import React, { useEffect, useRef } from 'react';

const CursorEffect = () => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const cursor = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Set canvas to full screen
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // Track mouse position
        const handleMouseMove = (e) => {
            cursor.current.x = e.clientX;
            cursor.current.y = e.clientY;

            // Add particles on move
            addParticle(e.clientX, e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Particle System
        const colors = ['#58a6ff', '#1f6feb', '#e6edf3', '#79c0ff', '#d2a8ff']; // Blue & Light themes

        function addParticle(x, y) {
            // Create multiple particles for a richer effect
            for (let i = 0; i < 3; i++) {
                particles.current.push({
                    x: x,
                    y: y,
                    size: Math.random() * 4 + 1, // Random size
                    speedX: Math.random() * 2 - 1, // Random drift
                    speedY: Math.random() * 2 - 1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 1, // Full opacity start
                    decay: Math.random() * 0.02 + 0.01 // Random fade speed
                });
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.current.length; i++) {
                let p = particles.current[i];

                // Update
                p.x += p.speedX;
                p.y += p.speedY;
                p.size *= 0.95; // Shrink
                p.life -= p.decay;

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();

                // Remove dead particles
                if (p.life <= 0 || p.size <= 0.2) {
                    particles.current.splice(i, 1);
                    i--;
                }
            }

            // Restore alpha
            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none', // Crucial: lets clicks pass through
                zIndex: 9999
            }}
        />
    );
};

export default CursorEffect;
