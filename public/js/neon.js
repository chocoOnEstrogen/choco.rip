class NeonBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'neon-background';
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        
        this.particles = [];
        this.particleCount = 100; // Increased particles
        this.colors = [
            'rgba(255, 0, 230, 0.8)',   // Hot pink
            'rgba(0, 255, 200, 0.8)',    // Cyan
            'rgba(255, 240, 0, 0.8)',    // Yellow
            'rgba(180, 0, 255, 0.8)',    // Purple
            'rgba(0, 255, 100, 0.8)'     // Neon green
        ];
        this.lastTime = 0;
        this.fps = 60;
        this.fpsInterval = 1000 / this.fps;
        this.time = 0;
        
        this.resizeCanvas();
        this.init();
        this.animate();
        this.handleResize();
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
        this.ctx.globalCompositeOperation = 'lighter';
    }

    init() {
        this.particles = Array.from({length: this.particleCount}, () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            radius: Math.random() * 3 + 2, // Larger particles
            vx: (Math.random() - 0.5) * 4, // Faster movement
            vy: (Math.random() - 0.5) * 4,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            trail: [],
            trailLength: Math.floor(Math.random() * 30) + 20, // Longer trails
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            pulseSpeed: Math.random() * 0.1,
            initialRadius: Math.random() * 3 + 2
        }));
    }

    drawParticle(particle, time) {
        // Pulsing effect
        particle.radius = particle.initialRadius * (1 + Math.sin(time * particle.pulseSpeed) * 0.5);
        
        // Spiral trail
        if (particle.trail.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
            
            for (let i = 1; i < particle.trail.length; i++) {
                const p = particle.trail[i];
                const ctrl1 = {
                    x: particle.trail[i-1].x + Math.cos(particle.angle) * 20,
                    y: particle.trail[i-1].y + Math.sin(particle.angle) * 20
                };
                const ctrl2 = {
                    x: p.x - Math.cos(particle.angle) * 20,
                    y: p.y - Math.sin(particle.angle) * 20
                };
                this.ctx.bezierCurveTo(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, p.x, p.y);
            }
            
            this.ctx.strokeStyle = particle.color;
            this.ctx.lineWidth = particle.radius * Math.sin(time * 0.01) * 0.5 + particle.radius;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }

        // Draw particle with chromatic aberration
        [-1, 0, 1].forEach((offset, i) => {
            const color = particle.color.replace('rgba', 'rgba').replace('0.8', '0.3');
            this.ctx.beginPath();
            this.ctx.arc(particle.x + offset * 2, particle.y, particle.radius * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = color.replace('rgba(', `rgba(${i === 0 ? '255,0,0' : i === 1 ? '0,255,0' : '0,0,255'},`);
            this.ctx.fill();
        });

        // Enhanced glow effect
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius * 8
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.5, particle.color.replace('0.8', '0.3'));
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius * 8, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    updateParticle(particle) {
        // Update trail with spiral motion
        particle.angle += particle.rotationSpeed;
        particle.trail.unshift({ 
            x: particle.x + Math.cos(particle.angle) * 2, 
            y: particle.y + Math.sin(particle.angle) * 2 
        });
        
        if (particle.trail.length > particle.trailLength) {
            particle.trail.pop();
        }

        // Update position with warping effect
        particle.x += particle.vx + Math.sin(this.time * 0.001 + particle.y * 0.01) * 0.5;
        particle.y += particle.vy + Math.cos(this.time * 0.001 + particle.x * 0.01) * 0.5;

        // Wrap around edges with smooth transition
        if (particle.x < -50) particle.x = this.canvas.width + 50;
        if (particle.x > this.canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = this.canvas.height + 50;
        if (particle.y > this.canvas.height + 50) particle.y = -50;
    }

    draw() {
        // Trippy background fade
        this.ctx.fillStyle = `hsla(${this.time * 0.1 % 360}, 50%, 5%, 0.1)`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle, this.time);
        });
    }

    animate(currentTime) {
        requestAnimationFrame(time => this.animate(time));
        
        const elapsed = currentTime - this.lastTime;
        if (elapsed < this.fpsInterval) return;
        
        this.lastTime = currentTime - (elapsed % this.fpsInterval);
        this.time = currentTime;
        this.draw();
    }

    handleResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
                this.init();
            }, 250);
        });
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => new NeonBackground());