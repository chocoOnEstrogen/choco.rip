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
                    return commandManager.getCommands()
                        .some(c => c.name.toLowerCase() === value.toLowerCase());
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

    private formatSection(title: string, content: string): string {
        return `${title}\n${content}\n`;
    }

    private formatSynopsis(command: Command): string {
        const commandArgs = command.args as CommandArgs | undefined;
        if (!commandArgs || Object.keys(commandArgs).length === 0) {
            return `    ${command.name}\n`;
        }

        return Object.entries(commandArgs)
            .map(([name, config]) => {
                if (config.type === 'boolean') {
                    return config.required ? `--${name}` : `[--${name}]`;
                }
                return config.required ? 
                    `--${name}=<${config.type}>` : 
                    `[--${name}=<${config.type}>]`;
            })
            .reduce((acc, curr) => `${acc} ${curr}`, `    ${command.name}`) + '\n';
    }

    private formatOptions(commandArgs: CommandArgs): string {
        let options = '';
        for (const [name, config] of Object.entries(commandArgs)) {
            options += `    --${name}`;
            if (config.type !== 'boolean') {
                options += `=<${config.type}>`;
            }
            options += `\n        ${config.description}\n`;
            
            if (!config.required) {
                const defaultValue = typeof config.default === 'string' ? 
                    `"${config.default}"` : config.default;
                options += `        Default: ${defaultValue}\n`;
            }
            
            if ('choices' in config && config.choices) {
                options += `        Choices: ${config.choices.join(', ')}\n`;
            }
            
            if (config.type === 'boolean') {
                options += `        Usage: --${name} or --${name}=true/false\n`;
            }
            
            options += '\n';
        }
        return options;
    }

    private getExamples(command: Command): string {
        const examples: string[] = [];
        const commandArgs = command.args as CommandArgs | undefined;
        
        if (!commandArgs) {
            return `    ${command.name}\n`;
        }

        // Basic usage
        examples.push(`    ${command.name} ${
            Object.entries(commandArgs)
                .filter(([_, config]) => config.required)
                .map(([name, config]) => 
                    `--${name}=${config.type === 'string' ? 'value' : config.default}`)
                .join(' ')
        }`);

        // Usage with optional args
        const optionalArgs = Object.entries(commandArgs)
            .filter(([_, config]) => !config.required)
            .map(([name, _]) => name)[0];
            
        if (optionalArgs) {
            examples.push(`    ${command.name} ${
                Object.entries(commandArgs)
                    .filter(([_, config]) => config.required)
                    .map(([name, config]) => 
                        `--${name}=${config.type === 'string' ? 'value' : config.default}`)
                    .join(' ')
            } --${optionalArgs}=${commandArgs[optionalArgs].type === 'boolean' ? 'true' : 'custom_value'}`);
        }

        return examples.join('\n') + '\n';
    }

    async execute(args: string[]): Promise<string> {
        const parsedArgs = this.parseArgs(args);

        if (parsedArgs.help) {
            return this.generateHelp();
        }

        const commandName = (parsedArgs.command as string).toLowerCase();
        const command = this.commandManager.getCommands()
            .find(cmd => cmd.name.toLowerCase() === commandName);

        if (!command) {
            return `No manual entry for '${commandName}'`;
        }

        let manPage = '';

        // NAME section
        manPage += this.formatSection('NAME',
            `    ${command.name} - ${command.description}`);

        // SYNOPSIS section
        manPage += this.formatSection('SYNOPSIS',
            this.formatSynopsis(command));

        // DESCRIPTION section
        manPage += this.formatSection('DESCRIPTION',
            `    ${command.description}`);

        // OPTIONS section
        if (command.args && Object.keys(command.args).length > 0) {
            manPage += this.formatSection('OPTIONS',
                this.formatOptions(command.args));
        }

        // EXAMPLES section
        manPage += this.formatSection('EXAMPLES',
            this.getExamples(command));

        // SEE ALSO section
        const relatedCommands = this.commandManager.getCommands()
            .filter(cmd => cmd.name !== command.name)
            .map(cmd => cmd.name)
            .join(', ');
        
        manPage += this.formatSection('SEE ALSO',
            `    ${relatedCommands}`);

        return manPage;
    }
} 