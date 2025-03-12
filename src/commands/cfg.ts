import { Command, type ParsedArgs, type WebSettings } from '../classes/command'

const backgrounds = [
	{ name: 'Nodes and Links', value: 'nodes-and-links' },
	{ name: 'Matrix', value: 'matrix' },
	{ name: 'Neon', value: 'neon' },
] as const;

const handlers = {
	background: (parsedArgs: ParsedArgs, webSettings: WebSettings) => {
		const background = parsedArgs.background as string

		if (!background) {
			return `Current background: ${backgrounds.find((b) => b.value === webSettings.background)?.name || 'Default'}. Available options: ${backgrounds.map((b) => b.value).join(', ')}`
		}

		const bg = backgrounds.find((b) => b.value === background)
		if (!bg) {
			return `Unknown background: ${background}. Available options: ${backgrounds.map((b) => b.value).join(', ')}`
		}

		document.body.dataset.background = bg.value
		return `Background configured to ${bg.name}`
	},
	oneko: (parsedArgs: ParsedArgs, webSettings: WebSettings) => {
		const oneko = parsedArgs.oneko as boolean
		const onekoElement = document.getElementById('oneko')

		if (!onekoElement) {
			return 'Oneko element not found'
		}

		onekoElement.style.display = oneko ? 'block' : 'none'
		return oneko ? 'Oneko enabled' : 'Oneko disabled'
	}
}

export class CfgCommand extends Command {
	constructor() {
		super('cfg', 'Configure the website', {
			background: {
				type: 'string',
				description: 'Background style',
				required: false,
				default: 'nodes-and-links',
				choices: backgrounds.map(b => b.value),
			},
			oneko: {
				type: 'boolean',
				description: 'Enable or disable oneko (cat)',
				required: false,
				default: false,
			},
			help: {
				type: 'boolean',
				description: 'Show this help message',
				required: false,
				default: false,
			}
		})
	}

	async execute(args: string[]): Promise<string> {
		const parsedArgs = this.parseArgs(args)
		
		if (parsedArgs.help) {
			return this.generateHelp()
		}

		const currentSettings = this.webSettings(parsedArgs, 'get')
		const results: string[] = []

		if (this.hasArg(args, 'background')) {
			results.push(handlers.background(parsedArgs, currentSettings))
		}
		if (this.hasArg(args, 'oneko')) {
			results.push(handlers.oneko(parsedArgs, currentSettings))
		}
		if (results.length === 0) {
			return this.generateHelp()
		}

		// Update settings after handling the command
		const newSettings: WebSettings = {
			...currentSettings,
			background: document.body.dataset.background || currentSettings.background,
			oneko: document.getElementById('oneko')?.style.display !== 'none'
		}
		this.webSettings({ background: newSettings.background, oneko: newSettings.oneko }, 'set')
		results.push('Settings updated. Reloading...')
		setTimeout(() => {
			location.reload()
		}, 2000)
		return results.join('\n')
	}
}
