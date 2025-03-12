import { Command } from '../classes/command';

export class CfgCommand extends Command {
    constructor() {
        super('cfg', 'Configure the website');
    }

    async execute(): Promise<string> {
        return 'Terminal configured';
    }
} 