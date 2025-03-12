import { Command, CommandManager, type CommandArgs } from '../classes/command';

export class ManCommand extends Command {
    private commandManager: CommandManager;

    constructor(commandManager: CommandManager) {
        super('man', 'Display manual pages for commands', {
            command: {
                type: 'string',
                description: 'The command to show manual for',
                required: true,
                default: '',
                validator: (value: string) => {
                    const cmd = commandManager.getCommands().find(c => c.name.toLowerCase() === value.toLowerCase());
                    return cmd !== undefined;
                }
            },
            help: {
                type: 'boolean',
                description: 'Show this help message',
                required: false,
                default: false
            }
        });
        this.commandManager = commandManager;
    }

    async execute(args: string[]): Promise<string> {
        const parsedArgs = this.parseArgs(args);

        if (parsedArgs.help) {
            return this.generateHelp();
        }

        const commandName = (parsedArgs.command as string).toLowerCase();
        const command = this.commandManager.getCommands().find(cmd => cmd.name.toLowerCase() === commandName);

        // This should never happen due to validator, but type safety
        if (!command) {
            return `No manual entry for '${commandName}'`;
        }

        // Generate manual format
        let manPage = `NAME\n    ${command.name} - ${command.description}\n\n`;
        
        manPage += 'SYNOPSIS\n';
        const commandArgs = command.args as CommandArgs | undefined;
        if (commandArgs && Object.keys(commandArgs).length > 0) {
            const usage = Object.entries(commandArgs)
                .map(([name, config]) => {
                    return config.required ? `--${name}=<${config.type}>` : `[--${name}=<${config.type}>]`;
                })
                .join(' ');
            manPage += `    ${command.name} ${usage}\n`;
        } else {
            manPage += `    ${command.name}\n`;
        }
        manPage += '\n';

        if (commandArgs && Object.keys(commandArgs).length > 0) {
            manPage += 'OPTIONS\n';
            for (const [name, config] of Object.entries(commandArgs)) {
                manPage += `    --${name}=<${config.type}>\n`;
                manPage += `        ${config.description}\n`;
                if (!config.required) {
                    manPage += `        Default: ${config.default}\n`;
                }
                if ('choices' in config && config.choices) {
                    manPage += `        Choices: ${config.choices.join(', ')}\n`;
                }
                manPage += '\n';
            }
        }

        manPage += 'DESCRIPTION\n';
        manPage += `    ${command.description}\n`;

        return manPage;
    }
} 