export function normalizeSocial(social: string) {
    return social.charAt(0).toUpperCase() + social.slice(1);
}

export function colorize(text: string, colorString: string, element: string) {
    return `<${element} style="color: ${colorString}">${text}</${element}>`;
}

export function makePath(path: string): string {
    // Normalize path by removing leading/trailing slashes and whitespace
    const normalizedPath = path.trim().replace(/^\/+|\/+$/g, '');

    // Handle empty path case
    if (!normalizedPath) {
        return '~';
    }

    // Split path into segments
    const segments = normalizedPath.split('/');
    
    // For blog posts, remove the last segment (slug) if it matches the pattern
    if (segments[0] === 'blog' && segments.length > 4) {
        // Check if we have a date-like pattern (YYYY/MM/DD/slug)
        const isDatePattern = /^\d{4}$/.test(segments[1]) && 
                            /^\d{1,2}$/.test(segments[2]) && 
                            /^\d{1,2}$/.test(segments[3]);
        
        if (isDatePattern) {
            segments.pop();
        }
    }

    // Always capitalize first segment
    if (segments[0]) {
        segments[0] = segments[0].charAt(0).toUpperCase() + segments[0].slice(1).toLowerCase();
    }

    // Format path with ~/
    return `~/${segments.join('/')}`;
}