import { spawn } from 'child_process'
import os from 'os'
import { existsSync } from 'fs'
import readline from 'readline'
import { CONFIG_PATH } from '@/paths'

// Map of editor choices for Windows
const WINDOWS_EDITORS = {
	'1': 'notepad',
	'2': 'code',
	'3': 'nano',
	'4': 'vim',
	'5': 'emacs',
	'6': 'sublime',
	'7': 'nvim',
} as const

async function editConfig() {
	const configPath = CONFIG_PATH

	// Check if config file exists
	if (!existsSync(configPath)) {
		console.error(`Config file not found at ${configPath}`)
		process.exit(1)
	}

	let editor: string

	// Determine editor based on platform and environment
	if (os.platform() === 'win32') {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		})

		console.log('Select an editor:')
		console.log('1. Notepad')
		console.log('2. VSCode')
		console.log('3. Nano')

		editor = await new Promise<string>((resolve) => {
			rl.question('Editor (1-3): ', (answer) => {
				rl.close()
				const selectedEditor =
					WINDOWS_EDITORS[answer as keyof typeof WINDOWS_EDITORS]
				if (!selectedEditor) {
					console.error('Invalid editor selection')
					process.exit(1)
				}
				resolve(selectedEditor)
			})
		})
	} else {
		editor = process.env.EDITOR || process.env.VISUAL || 'nano'
	}

	return new Promise<void>((resolve, reject) => {
		const child = spawn(editor, [configPath], {
			stdio: 'inherit',
		})

		child.on('error', (error) => {
			console.error('Failed to open editor:', error)
			reject(error)
		})

		child.on('exit', (code) => {
			if (code === 0) {
				console.log('Config file edited successfully')
				resolve()
			} else {
				const error = new Error(`Editor exited with code ${code}`)
				console.error(error.message)
				reject(error)
			}
		})
	}).catch(() => process.exit(1))
}

editConfig()
