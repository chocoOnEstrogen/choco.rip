document.addEventListener('DOMContentLoaded', () => {
    const markdownImages = document.querySelectorAll('.markdown img[alt]:not([alt=""])');
    
    markdownImages.forEach(img => {
        // Only process images that aren't already in a figure
        if (!img.parentElement.matches('figure')) {
            const figure = document.createElement('figure');
            const figcaption = document.createElement('figcaption');
            
            // Set the figcaption text content directly
            figcaption.textContent = img.alt;
            
            // Replace the image with the figure structure
            img.parentNode.insertBefore(figure, img);
            figure.appendChild(img);
            figure.appendChild(figcaption);
        }
    });
});
