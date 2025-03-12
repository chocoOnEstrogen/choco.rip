import config from '../config';
import { Command } from '../classes/command';   

export class ContactCommand extends Command {
    constructor() {
        super('contact', 'Display contact information');
    }

    async execute(): Promise<string> {
        return `Email: ${config.author.email}
GitHub: ${config.author.social.github}`;
    }
} 