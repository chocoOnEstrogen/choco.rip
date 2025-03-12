class MatrixBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'matrix-background';
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        
        this.nodes = [];
        this.nodeCount = Math.floor(window.innerWidth * window.innerHeight / 25000); // Dynamic node count
        this.maxDistance = Math.min(150, window.innerWidth / 8); // Adaptive max distance
        this.lastTime = 0;
        this.fps = 60;
        this.fpsInterval = 1000 / this.fps;
        
        this.resizeCanvas();
        this.init();
        this.animate();
        this.handleResize();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.strokeStyle = 'rgba(141, 193, 73, 0.15)'; // Everforest green
        this.ctx.lineWidth = 1;
    }

    init() {
        this.nodes = Array.from({length: this.nodeCount}, () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1
        }));
    }

    drawNodes() {
        this.ctx.fillStyle = 'rgba(141, 193, 73, 0.5)';
        this.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Update position with boundary check
            node.x += node.vx;
            node.y += node.vy;
            
            if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;
        });
    }

    drawLines() {
        this.ctx.beginPath();
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const distance = dx * dx + dy * dy; // Faster than Math.hypot
                
                if (distance < this.maxDistance * this.maxDistance) {
                    this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                    this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                }
            }
        }
        this.ctx.stroke();
    }

    animate(currentTime) {
        requestAnimationFrame(time => this.animate(time));
        
        const elapsed = currentTime - this.lastTime;
        if (elapsed < this.fpsInterval) return;
        
        this.lastTime = currentTime - (elapsed % this.fpsInterval);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawNodes();
        this.drawLines();
    }

    handleResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
                this.nodeCount = Math.floor(window.innerWidth * window.innerHeight / 25000);
                this.maxDistance = Math.min(150, window.innerWidth / 8);
                this.init();
            }, 250);
        });
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => new MatrixBackground());