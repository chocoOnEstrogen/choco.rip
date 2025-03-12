import { Command } from '../classes/command';
import config from '../config';

export class SocialsCommand extends Command {
    constructor() {
        super('socials', 'List all social media platforms');
    }

    async execute(): Promise<string> {
        const socialEntries = Object.entries(config.author.social);
        
        return socialEntries.map(([platform, url]) => {
            const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
            return `[${platformName}] <a href="${url}" class="text-everforest-blue" rel="noopener noreferrer" target="_blank">${url}</a>`;
        }).join('\n');
    }
} 