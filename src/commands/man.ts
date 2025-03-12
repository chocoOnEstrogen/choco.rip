import { Command, CommandManager } from '../classes/command';

export class ManCommand extends Command {
    private commandManager: CommandManager;

    constructor(commandManager: CommandManager) {
        super('man', 'Display manual pages for commands', {
            command: {
                type: 'string',
                description: 'The command to show manual for',
                required: true,
                default: ''
            }
        });
        this.commandManager = commandManager;
    }

    async execute(args: string[]): Promise<string> {
        if (args.length === 0) {
            return 'Usage: man <command>\nExample: man help';
        }

        const commandName = args[0].toLowerCase();
        const command = this.commandManager.getCommands().find(cmd => cmd.name.toLowerCase() === commandName);

        if (!command) {
            return `No manual entry for '${commandName}'`;
        }

        let manPage = `NAME\n    ${command.name} - ${command.description}\n\n`;
        
        manPage += 'SYNOPSIS\n';
        if (command.args && Object.keys(command.args).length > 0) {
            const usage = Object.entries(command.args)
                .map(([name, config]) => {
                    return config.required ? `--${name}=<value>` : `[--${name}=<value>]`;
                })
                .join(' ');
            manPage += `    ${command.name} ${usage}\n`;
        } else {
            manPage += `    ${command.name}\n`;
        }
        manPage += '\n';

        if (command.args && Object.keys(command.args).length > 0) {
            manPage += 'OPTIONS\n';
            for (const [name, config] of Object.entries(command.args)) {
                manPage += `    --${name}=<${config.type}>\n`;
                manPage += `        ${config.description}\n`;
                if (!config.required) {
                    manPage += `        Default: ${config.default}\n`;
                }
                manPage += '\n';
            }
        }

        manPage += 'DESCRIPTION\n';
        manPage += `    ${command.description}\n`;

        return manPage;
    }
} 