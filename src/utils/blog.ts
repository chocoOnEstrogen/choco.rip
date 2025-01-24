export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    // Remove extra whitespace and split by whitespace characters
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Add a minimum reading time of 1 minute
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function createSlug(date: Date, slug: string): string {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${slug}`;
}
