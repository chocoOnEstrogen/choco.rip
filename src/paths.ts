import path from 'path'
import fs from 'fs'

// Read the app data directory from .github/app-data.txt
function getAppDataDir(): string {
	try {
		const appDataPath = path.join(process.cwd(), '.github', 'app-data.txt')
		if (!fs.existsSync(appDataPath)) {
			throw new Error(
				'App data file not found. Please run npm run setup-data first.',
			)
		}
		return fs.readFileSync(appDataPath, 'utf8').trim()
	} catch (error) {
		console.error('Error reading app data path:', error)
		throw error
	}
}

function makeDir(dir: string) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

function makeFile(file: string) {
	if (!fs.existsSync(file)) {
		fs.writeFileSync(file, '')
	}
}

export function ensureDirs() {
	const appdataDir = getAppDataDir()
	makeDir(appdataDir)
	makeDir(PAGES_DIR)
	makeDir(UPLOADS_DIR)
	makeFile(CONFIG_PATH)
}

const appdataDir = getAppDataDir()

// Export the paths
export const PAGES_DIR = path.join(appdataDir, 'pages')
export const CONFIG_PATH = path.join(appdataDir, 'config.yml')
export const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')
