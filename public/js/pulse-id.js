document.addEventListener('DOMContentLoaded', function() {
    // Get all text nodes in the document
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        const text = node.textContent;
        const hashtagPattern = /#[\w-]+/g;
        
        if (hashtagPattern.test(text)) {
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            let match;
            
            // Reset the regex
            hashtagPattern.lastIndex = 0;
            
            while ((match = hashtagPattern.exec(text)) !== null) {
                // Add text before the hashtag
                fragment.appendChild(
                    document.createTextNode(text.slice(lastIndex, match.index))
                );
                
                const hashtagId = match[0].substring(1); // Remove # from start
                const element = document.getElementById(hashtagId);
                
                if (element) {
                    // Create span for hashtag text
                    const hashtagSpan = document.createElement('span');
                    hashtagSpan.textContent = match[0];
                    hashtagSpan.classList.add('hashtag-link');
                    hashtagSpan.style.color = 'var(--everforest-blue)';
                    hashtagSpan.style.cursor = 'pointer';

                    // Add initial pulse animation
                    let pulseCount = 0;
                    const colors = ['var(--everforest-blue)', 'var(--everforest-green)', 'var(--everforest-yellow)', 'var(--everforest-purple)'];
                    const pulseInterval = setInterval(() => {
                        element.style.transition = 'background-color 0.3s';
                        element.style.backgroundColor = colors[pulseCount % colors.length];
                        pulseCount++;
                        
                        if (pulseCount >= 15) { // 5 seconds at ~333ms intervals
                            clearInterval(pulseInterval);
                            element.style.backgroundColor = '';
                        }
                    }, 333);
                    
                    // Add hover effect after pulse
                    hashtagSpan.addEventListener('mouseover', () => {
                        element.style.transition = 'background-color 0.3s';
                        element.style.backgroundColor = 'var(--everforest-bg-light)';
                    });
                    
                    hashtagSpan.addEventListener('mouseout', () => {
                        element.style.backgroundColor = '';
                    });
                    
                    // Add click handler to scroll to element
                    hashtagSpan.addEventListener('click', () => {
                        element.scrollIntoView({ behavior: 'smooth' });
                    });
                    
                    fragment.appendChild(hashtagSpan);
                } else {
                    // If no matching element, just add the text
                    fragment.appendChild(document.createTextNode(match[0]));
                }
                
                lastIndex = hashtagPattern.lastIndex;
            }
            
            // Add any remaining text
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
            node.parentNode.replaceChild(fragment, node);
        }
    }
});