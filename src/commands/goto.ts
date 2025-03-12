import { Command } from '../classes/command';

export class GotoCommand extends Command {
    private readonly MAX_TIMEOUT = 30000; // 30 seconds maximum timeout

    constructor() {
        super('goto', 'Navigate to a specified URL', {
            page: {
                type: 'string',
                description: 'The URL to navigate to',
                required: true,
                default: '',
            },
            timeout: {
                type: 'number',
                description: 'Delay in milliseconds before navigation (max 30000ms)',
                required: false,
                default: 0,
                validator: (value: number) => value >= 0 && value <= this.MAX_TIMEOUT
            }
        });
    }

    async execute(args: string[]): Promise<string> {
        try {
            const parsedArgs = this.parseArgs(args);
            let page = parsedArgs.page as string;
            const timeout = Math.min(parsedArgs.timeout as number || 0, this.MAX_TIMEOUT);

            if (timeout > 0) {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        try {
                            window.location.href = `/${page}`;
                            resolve(`Redirecting to ${page}...`);
                        } catch (error) {
                            resolve(`Failed to navigate to ${page}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                    }, timeout);
                    return `Scheduled navigation to ${page} in ${timeout}ms...`;
                });
            } else {
                window.location.href = `/${page}`;
                return `Redirecting to ${page}...`;
            }
        } catch (error) {
            throw new Error(`Navigation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}