import { Command, CommandManager } from '../classes/command';

export class HelpCommand extends Command {
    private commandManager: CommandManager;

    constructor(commandManager: CommandManager) {
        super('help', 'Show available commands', {
            command: {
                type: 'string',
                description: 'Show detailed help for a specific command',
                required: false,
                default: '',
                validator: (value: string) => {
                    if (!value) return true;
                    const cmd = commandManager.getCommands().find(c => c.name.toLowerCase() === value.toLowerCase());
                    return cmd !== undefined;
                }
            }
        });
        this.commandManager = commandManager;
    }

    async execute(args: string[]): Promise<string> {
        const parsedArgs = this.parseArgs(args);
        const commands = this.commandManager.getCommands();

        // If a specific command is requested, show its detailed help
        if (parsedArgs.command) {
            const command = commands.find(cmd => cmd.name.toLowerCase() === (parsedArgs.command as string).toLowerCase());
            if (command) {
                return this.generateHelp();
            }
        }

        // Otherwise show the command list
        const commandsByCategory: { [key: string]: Command[] } = {};
        
        // Sort commands into categories based on their description or functionality
        commands.forEach(cmd => {
            let category = 'General';
            if (cmd.description.toLowerCase().includes('config')) category = 'Configuration';
            else if (cmd.name === 'help' || cmd.name === 'man') category = 'Help';
            else if (cmd.description.toLowerCase().includes('project')) category = 'Projects';
            
            if (!commandsByCategory[category]) {
                commandsByCategory[category] = [];
            }
            commandsByCategory[category].push(cmd);
        });

        // Generate formatted output
        let output = 'Available Commands:\n\n';
        
        for (const [category, cmds] of Object.entries(commandsByCategory)) {
            output += `${category}:\n`;
            cmds.sort((a, b) => a.name.localeCompare(b.name))
                .forEach(cmd => {
                    let cmdStr = `    ${cmd.name.padEnd(15)} - ${cmd.description}`;
                    if (cmd.args && Object.keys(cmd.args).length > 0) {
                        cmdStr += ' [has options]';
                    }
                    output += cmdStr + '\n';
                });
            output += '\n';
        }

        output += 'For detailed help on a specific command, use:\n';
        output += '    help --command=<command_name>\n';
        output += '    or\n';
        output += '    man <command_name>\n';

        return output;
    }
} 