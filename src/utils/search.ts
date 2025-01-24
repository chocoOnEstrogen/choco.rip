type SearchToken = {
    type: 'tag' | 'year' | 'author' | 'category' | 'before' | 'after' | 'text';
    value: string;
    operator?: 'AND' | 'OR' | 'NOT';
};

export class SearchParser {
    private static readonly PATTERNS = {
        tag: /(?:^|\s)#(\w+)/g,           // #typescript
        year: /(?:^|\s)@(\d{4})/g,        // @2023
        author: /(?:^|\s)by:(\w+)/g,      // by:stella
        category: /(?:^|\s)in:(\w+)/g,    // in:tutorials
        before: /(?:^|\s)before:(\d{4})/g, // before:2024
        after: /(?:^|\s)after:(\d{4})/g,   // after:2022
        operator: /(?:^|\s)(AND|OR|NOT)\s/g, // AND, OR, NOT
    };

    static parseQuery(query: string): SearchToken[] {
        const tokens: SearchToken[] = [];
        let remainingText = query;

        // Extract special patterns
        const patterns = this.PATTERNS;
        Object.entries(patterns).forEach(([type, pattern]) => {
            remainingText = remainingText.replace(pattern, (match, value) => {
                if (type !== 'operator') {
                    tokens.push({ type: type as SearchToken['type'], value: value.toLowerCase() });
                }
                return ' '; // Remove matched pattern from text
            });
        });

        // Add remaining text as text tokens
        const textParts = remainingText.trim().split(/\s+/).filter(Boolean);
        textParts.forEach(part => {
            tokens.push({ type: 'text', value: part.toLowerCase() });
        });

        return tokens;
    }

    static matchesPost(post: any, tokens: SearchToken[]): boolean {
        if (tokens.length === 0) return true;

        return tokens.every(token => {
            switch (token.type) {
                case 'tag':
                    return post.tags.some((tag: string) => 
                        tag.toLowerCase().includes(token.value)
                    );

                case 'year':
                    const postYear = new Date(post.date).getFullYear().toString();
                    return postYear === token.value;

                case 'author':
                    return post.author?.toLowerCase().includes(token.value);

                case 'category':
                    return post.categories?.some((cat: string) => 
                        cat.toLowerCase().includes(token.value)
                    );

                case 'before':
                    const beforeYear = new Date(post.date).getFullYear();
                    const beforeTarget = parseInt(token.value);
                    return !isNaN(beforeTarget) && beforeYear <= beforeTarget;

                case 'after':
                    const afterYear = new Date(post.date).getFullYear();
                    const afterTarget = parseInt(token.value);
                    return !isNaN(afterTarget) && afterYear >= afterTarget;

                case 'text':
                    const searchableText = [
                        post.title,
                        post.excerpt,
                        post.content
                    ].join(' ').toLowerCase();
                    return searchableText.includes(token.value);

                default:
                    return false;
            }
        });
    }
}

// Helper function to highlight matched content
export function highlightMatches(text: string, tokens: SearchToken[]): string {
    let highlightedText = text;
    tokens.forEach(token => {
        if (token.type === 'text') {
            const regex = new RegExp(`(${token.value})`, 'gi');
            highlightedText = highlightedText.replace(regex, 
                '<mark class="bg-emerald-400/20 text-emerald-400 px-1 rounded">$1</mark>'
            );
        }
    });
    return highlightedText;
} 