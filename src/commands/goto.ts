import { Command } from '../classes/command';

export class GotoCommand extends Command {
    constructor() {
        super('goto', 'Goto a page', {
            page: {
                type: 'string',
                description: 'The page to goto',
                required: true,
                default: ''
            },
            timeout: {
                type: 'number',
                description: 'The timeout for the goto',
                required: false,
                default: 0
            }
        });
    }

    async execute(args: string[]): Promise<string> {
        const page = args[0];
        const timeout = parseInt(args[1]) || 0;

        if (timeout > 0) {
            setTimeout(() => {
                window.location.href = page;
            }, timeout);
            return `Redirecting to ${page} in ${timeout}ms...`;
        } else {
            window.location.href = page;
            return `Redirecting to ${page}...`;
        }
    }
}