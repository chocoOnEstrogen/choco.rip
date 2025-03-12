class MatrixBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'matrix-background';
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize for non-transparent canvas
        document.body.appendChild(this.canvas);
        
        // Configuration
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        this.characters = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789'.split('');
        this.lastTime = 0;
        this.fps = 30;
        this.fpsInterval = 1000 / this.fps;
        
        // Colors
        this.bgColor = 'rgb(43, 51, 57)';
        this.fadeColor = 'rgba(43, 51, 57, 0.95)'; 
        this.textColor = 'rgba(167, 192, 128, 0.8)';
        
        this.resizeCanvas();
        this.init();
        this.animate(0); // Pass initial timestamp
        this.handleResize();
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Set display size
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // Set actual size in memory
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        // Scale context to match device pixel ratio
        this.ctx.scale(dpr, dpr);
        
        this.ctx.font = `${this.fontSize}px 'Fira Code', monospace`;
        this.columns = Math.floor(width / this.fontSize);
    }

    init() {
        // Initialize drops with random starting positions
        this.drops = Array(this.columns).fill(0).map(() => 
            Math.floor(Math.random() * -100)
        );
    }

    draw() {
        // Create fade effect
        this.ctx.fillStyle = this.fadeColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.textColor;
        
        for (let i = 0; i < this.drops.length; i++) {
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            
            if (y > 0) { // Only draw visible characters
                const char = this.characters[Math.floor(Math.random() * this.characters.length)];
                this.ctx.fillText(char, x, y);
            }
            
            // Reset drop when it reaches bottom or randomly
            if (y > this.canvas.height) {
                if (Math.random() > 0.98) {
                    this.drops[i] = 0;
                }
            }
            this.drops[i]++;
        }
    }

    animate(currentTime) {
        requestAnimationFrame(time => this.animate(time));
        
        const elapsed = currentTime - this.lastTime;
        if (elapsed < this.fpsInterval) return;
        
        this.lastTime = currentTime - (elapsed % this.fpsInterval);
        this.draw();
    }

    handleResize() {
        const debounce = (fn, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => fn.apply(this, args), delay);
            };
        };

        window.addEventListener('resize', debounce(() => {
            this.resizeCanvas();
            this.init();
        }, 250));
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => new MatrixBackground());