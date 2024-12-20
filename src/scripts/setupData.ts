import fs from 'fs'
import path from 'path'
import os from 'os'
import chalk from 'chalk'
import readline from 'readline'

const args = process.argv.slice(2)

function getAppDataDir(appName: string) {
	const osType = os.type()
	if (osType === 'Darwin') {
		return path.join(
			os.homedir(),
			'Library',
			'Application Support',
			slugify(appName),
		)
	} else if (osType === 'Windows_NT') {
		return path.join(os.homedir(), 'AppData', 'Roaming', slugify(appName))
	} else {
		return path.join(os.homedir(), '.config', slugify(appName))
	}
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/ /g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
}

const setupData = async () => {
	const tmp = path.join(os.tmpdir())
	const cwd = process.cwd()

	const websiteName = await new Promise<string>((resolve) => {
		rl.question(chalk.cyan('Enter your website name: '), (name) => {
			if (!name || name.trim() === '') {
				console.error(chalk.red('Website name is required'))
				process.exit(1)
			}
			resolve(name)
		})
	})

	if (fs.existsSync(path.join(tmp, 'website-data.txt'))) {
		fs.unlinkSync(path.join(tmp, 'website-data.txt'))
	}

	if (fs.existsSync(path.join(cwd, '.github', 'app-data.txt'))) {
		fs.unlinkSync(path.join(cwd, '.github', 'app-data.txt'))
	}

	const websiteDataPath = path.join(tmp, 'website-data.txt')
	const appDataPath = path.join(cwd, '.github', 'app-data.txt')
	fs.writeFileSync(websiteDataPath, slugify(websiteName))
	fs.writeFileSync(appDataPath, getAppDataDir(websiteName))

	console.log(chalk.green('Website data file created successfully'))
	rl.close()
}

if (args.includes('--first-time')) {
	setupData().catch(console.error)
}
