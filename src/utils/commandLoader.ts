import { Command, CommandManager } from '../classes/command';
import { HelpCommand } from '../commands/help';
import { ManCommand } from '../commands/man';
import { commands } from '../commands';

export function loadCommands(): CommandManager {
    const commandManager = new CommandManager();
    
    
    commands.forEach(cmd => commandManager.registerCommand(cmd));
    
    // Register help and man commands last since they need access to all other commands
    commandManager.registerCommand(new ManCommand(commandManager));
    commandManager.registerCommand(new HelpCommand(commandManager));
    
    return commandManager;
} 