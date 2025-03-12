import { Command } from '../classes/command';

export class ClearCommand extends Command {
    constructor() {
        super('clear', 'Clear terminal screen');
    }

    async execute(): Promise<string> {
        return '';
    }
} 