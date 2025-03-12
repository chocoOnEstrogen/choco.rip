import { colorize } from '../utils/string';
import config from '../config';
import { Command } from '../classes/command';

interface SystemInfo {
    user: string;
    hostname: string;
    os: string;
    kernel: string;
    shell: string;
    resolution: string;
    de: string;
    wm: string;
    theme: string;
    icons: string;
    terminal: string;
    memory: string;
}

const systemInfo: SystemInfo = {
    user: config.author.name.toLowerCase(),
    hostname: 'archlinux',
    os: 'Arch Linux x86_64',
    kernel: '6.13.5-arch1-1',
    shell: 'zsh 5.9',
    resolution: '1366x768',
    de: 'Plasma 6.3.2',
    wm: 'kwin',
    theme: 'Breeze [GTK2/3]',
    icons: 'WhiteSur [GTK2/3]',
    terminal: 'konsole',
    memory: '32GB'
};

export class NeofetchCommand extends Command {
    constructor() {
        super('neofetch', 'Display system information');
    }

    async execute(): Promise<string> {
        const info = [
            `${colorize(`${systemInfo.user}@${systemInfo.hostname}`, '#89b4fa', 'span')}`,
            `${colorize('-'.repeat(systemInfo.user.length + systemInfo.hostname.length + 1), '#89b4fa', 'span')}`,
        `${colorize('OS:', '#89b4fa', 'span')} ${systemInfo.os}`,
        `${colorize('Kernel:', '#89b4fa', 'span')} ${systemInfo.kernel}`,
        `${colorize('Shell:', '#89b4fa', 'span')} ${systemInfo.shell}`,
        `${colorize('Resolution:', '#89b4fa', 'span')} ${systemInfo.resolution}`,
        `${colorize('DE:', '#89b4fa', 'span')} ${systemInfo.de}`,
        `${colorize('WM:', '#89b4fa', 'span')} ${systemInfo.wm}`,
        `${colorize('Theme:', '#89b4fa', 'span')} ${systemInfo.theme}`,
        `${colorize('Icons:', '#89b4fa', 'span')} ${systemInfo.icons}`,
        `${colorize('Terminal:', '#89b4fa', 'span')} ${systemInfo.terminal}`,
        `${colorize('Memory:', '#89b4fa', 'span')} ${systemInfo.memory}`
    ].join('\n');

    return `<div class="flex items-start gap-4">
        <img src="/images/archlinux-512.png" loading="lazy" alt="Arch Linux Logo" class="w-32 h-32" />
        <pre class="mt-2">${info}</pre>
    </div>`;
    }
} 