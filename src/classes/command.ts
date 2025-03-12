import { colorize } from "../utils/string";

export interface CommandArgs {
    [key: string]: {
        type: 'string' | 'boolean' | 'number';
        default: string | boolean | number;
        required: boolean;
        description: string;
        choices?: (string | number | boolean)[];
        validator?: (value: any) => boolean;
    }
}

export interface WebSettings {
    background: string;
    oneko: boolean;
}

export interface ParsedArgs {
    [key: string]: string | boolean | number;
}

export abstract class Command {
    constructor(public name: string, public description: string, public args?: CommandArgs, public privated?: boolean) {
        this.name = name;
        this.description = description;
        this.args = args || {};
        this.privated = privated || false;
    }

    protected parseArgs(args: string[]): ParsedArgs {
        const parsedArgs: ParsedArgs = {};
        const errors: string[] = [];
        
        // Initialize defaults
        if (this.args) {
            for (const [key, config] of Object.entries(this.args)) {
                parsedArgs[key] = config.default;
            }
        }

        // Parse provided args
        for (const arg of args) {
            if (!arg.startsWith('--')) continue;

            // Handle args with and without values
            const hasEquals = arg.includes('=');
            const [key, value] = hasEquals ? arg.slice(2).split('=') : [arg.slice(2), undefined];
            const argConfig = this.args?.[key];
                
            if (!argConfig) {
                errors.push(`Unknown argument: ${key}`);
                continue;
            }

            try {
                // Special handling for boolean flags
                if (argConfig.type === 'boolean') {
                    if (value === undefined) {
                        // --flag is equivalent to --flag=true
                        parsedArgs[key] = true;
                        continue;
                    }
                    // --flag=value still works as before
                    const parsedValue = this.parseValue(value, argConfig);
                    parsedArgs[key] = parsedValue;
                    continue;
                }

                // Non-boolean args still require a value
                if (value === undefined) {
                    throw new Error(`Missing value for argument: ${key}`);
                }

                const parsedValue = this.parseValue(value, argConfig);
                
                // Validate against choices if specified
                if (argConfig.choices && !argConfig.choices.includes(parsedValue)) {
                    throw new Error(`Invalid value for ${key}. Must be one of: ${argConfig.choices.join(', ')}`);
                }

                // Run custom validator if specified
                if (argConfig.validator && !argConfig.validator(parsedValue)) {
                    throw new Error(`Invalid value for ${key}`);
                }

                parsedArgs[key] = parsedValue;
            } catch (error) {
                errors.push(error instanceof Error ? error.message : `Invalid value for ${key}`);
            }
        }

        // Validate required args
        if (this.args) {
            for (const [key, config] of Object.entries(this.args)) {
                if (config.required && parsedArgs[key] === undefined) {
                    errors.push(`Missing required argument: ${key}`);
                }
            }
        }

        if (errors.length > 0) {
            throw new Error(`Invalid arguments:\n${errors.join('\n')}`);
        }

        return parsedArgs;
    }

    private parseValue(value: string, config: CommandArgs[string]): string | number | boolean {
        switch (config.type) {
            case 'number':
                const num = Number(value);
                if (isNaN(num)) {
                    throw new Error(`Invalid number: ${value}`);
                }
                return num;
            case 'boolean':
                const lower = value.toLowerCase();
                if (lower !== 'true' && lower !== 'false') {
                    throw new Error(`Invalid boolean: ${value}`);
                }
                return lower === 'true';
            case 'string':
                return value;
            default:
                throw new Error(`Unknown type: ${config.type}`);
        }
    }

    protected hasArg(args: string[], arg: string): boolean {
        return args.some(a => a === `--${arg}` || a.startsWith(`--${arg}=`));
    }

    protected webSettings(args: ParsedArgs, func: "get" | "set"): WebSettings {
        const COOKIE_MAX_AGE = 31536000; // 1 year in seconds
        const COOKIE_NAME = "web-settings";

        switch (func) {
            case "get":
                return JSON.parse(document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_NAME}=`))?.split('=')[1] || '{}');
            case "set":
                const settings = {
                    background: args.background as string,
                    oneko: args.oneko as boolean,
                };
                document.cookie = `${COOKIE_NAME}=${JSON.stringify(settings)}; path=/; max-age=${COOKIE_MAX_AGE}`;
                return settings;
            default:
                throw new Error(`Invalid function: ${func}`);
        }
    }

    protected log(message: string, element: string = 'p'): void {
        console.log(colorize(`[+] ${message}`, 'green', element));
    }

    protected error(message: string, element: string = 'p'): void {
        console.error(colorize(`ERR! ${message}`, 'red', element));
    }

    protected warn(message: string, element: string = 'p'): void {
        console.warn(colorize(`[!] ${message}`, 'yellow', element));
    }

    protected info(message: string, element: string = 'p'): void {
        console.info(colorize(`[i] ${message}`, 'blue', element));
    }

    protected generateHelp(): string {
        let help = `${this.name} - ${this.description}\n\n`;
        
        // Usage section
        help += 'USAGE\n';
        help += `    ${this.name}`;
        if (this.args && Object.keys(this.args).length > 0) {
            const usage = Object.entries(this.args)
                .map(([name, config]) => {
                    if (config.type === 'boolean') {
                        return config.required ? `--${name}` : `[--${name}]`;
                    }
                    return config.required ? `--${name}=<${config.type}>` : `[--${name}=<${config.type}>]`;
                })
                .join(' ');
            help += ` ${usage}`;
        }
        help += '\n\n';

        // Arguments section
        if (this.args && Object.keys(this.args).length > 0) {
            help += 'ARGUMENTS\n';
            for (const [name, config] of Object.entries(this.args)) {
                help += `    --${name}`;
                if (config.type !== 'boolean') {
                    help += `=<${config.type}>`;
                }
                help += '\n';
                help += `        ${config.description}\n`;
                help += `        Type: ${config.type}\n`;
                if (!config.required) {
                    help += `        Default: ${config.default}\n`;
                }
                if (config.choices) {
                    help += `        Choices: ${config.choices.join(', ')}\n`;
                }
                if (config.type === 'boolean') {
                    help += `        Usage: --${name} or --${name}=true/false\n`;
                }
                help += '\n';
            }
        }

        return help;
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
        return Array.from(this.commands.values()).filter(command => !command.privated);
    }
}