import { Command } from '../classes/command';

interface Page {
    name: string;
    path: string;
    description?: string;
}

const pages: Page[] = [
    {
        name: 'Home',
        path: '/',
        description: 'Main terminal interface'
    },
    {
        name: 'Blog', 
        path: '/blog',
        description: 'Collection of articles and thoughts'
    },
    {
        name: 'No Hello',
        path: '/no-hello',
        description: 'Why you should avoid just saying "hello" in chat'
    },
    {
        name: 'About',
        path: '/about',
        description: 'About me'
    },
    {
        name: 'Resources',
        path: '/resources',
        description: 'Collection of essential tools, learning materials, and community resources for developers.'
    },
    {
        name: 'Trans Resources',
        path: '/trans-resources',
        description: 'Collection of essential tools, learning materials, and community resources for transgender individuals.'
    }
];

export class PagesCommand extends Command {
    constructor() {
        super('pages', 'List all available pages with descriptions');
    }

    async execute(args: string[]): Promise<string> {        
        return pages.map(page => {
            let output = `- <a href="${page.path}" class="text-everforest-blue" rel="noopener noreferrer">${page.name} (${page.path})</a>`;
            if (page.description) {
                output += `\n  ${page.description}`;
            }
            return output;
        }).join('\n\n');
    }
}