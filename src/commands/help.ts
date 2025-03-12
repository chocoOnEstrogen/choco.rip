import { Command, CommandManager } from '../classes/command';

export class HelpCommand extends Command {
    private commandManager: CommandManager;

    constructor(commandManager: CommandManager) {
        super('help', 'Show available commands');
        this.commandManager = commandManager;
    }

    async execute(): Promise<string> {
        const commands = this.commandManager.getCommands();
        const commandList = commands
            .map(cmd => {
                let cmdStr = `    ${cmd.name.padEnd(10)} - ${cmd.description}`;
                if (cmd.args && Object.keys(cmd.args).length > 0) {
                    cmdStr += ` [HAS ARGUMENTS]`;
                }
                return cmdStr;
            })
            .join('\n');
        
        return `Available commands:\n${commandList}`;
    }
} 