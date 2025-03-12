export interface CommandArgs {
    [key: string]: {
        type: 'string' | 'boolean' | 'number';
        default: string | boolean | number;
        required: boolean;
        description: string;
    }
}

export interface ParsedArgs {
    [key: string]: string | boolean | number;
}

export abstract class Command {
    constructor(public name: string, public description: string, public args?: CommandArgs) {
        this.name = name;
        this.description = description;
        this.args = args || {};
    }

    protected parseArgs(args: string[]): ParsedArgs {
        const parsedArgs: ParsedArgs = {};
        
        // Initialize defaults
        if (this.args) {
            for (const [key, config] of Object.entries(this.args)) {
                parsedArgs[key] = config.default;
            }
        }

        // Parse provided args
        for (const arg of args) {
            if (arg.startsWith('--')) {
                const [key, value] = arg.slice(2).split('=');
                
                if (!this.args?.[key]) {
                    continue; // Skip unknown args
                }

                const argConfig = this.args[key];
                
                if (value === undefined) {
                    if (argConfig.type === 'boolean') {
                        parsedArgs[key] = true;
                    }
                    continue;
                }

                switch (argConfig.type) {
                    case 'number':
                        const isNumber = !isNaN(Number(value));
                        if (!isNumber) {
                            throw new Error(`Invalid number argument: ${key}=${value}`);
                        }
                        parsedArgs[key] = Number(value);
                        break;
                    case 'boolean':
                        const isBoolean = value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
                        if (!isBoolean) {
                            throw new Error(`Invalid boolean argument: ${key}=${value}`);
                        }
                        parsedArgs[key] = value.toLowerCase() === 'true';
                        break;
                    case 'string':
                        parsedArgs[key] = value;
                        break;
                }
            }
        }

        // Validate required args
        if (this.args) {
            for (const [key, config] of Object.entries(this.args)) {
                if (config.required && parsedArgs[key] === undefined) {
                    throw new Error(`Missing required argument: ${key}`);
                }
            }
        }

        return parsedArgs;
    }

    abstract execute(args: string[]): Promise<string>;
}

export class CommandManager {
    private commands: Map<string, Command> = new Map();

    constructor() {}

    registerCommand(command: Command): void {
        this.commands.set(command.name.toLowerCase(), command);
    }

    async executeCommand(name: string, args: string[]): Promise<string> {
        const command = this.commands.get(name.toLowerCase());
        if (!command) {
            return `Command not found: ${name}. Type 'help' for available commands.`;
        }
        return await command.execute(args);
    }

    getCommands(): Command[] {
        return Array.from(this.commands.values());
    }
}