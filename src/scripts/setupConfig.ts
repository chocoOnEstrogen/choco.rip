import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import readline from 'readline'
import chalk from 'chalk'
import os from 'os'

const username = os.userInfo().username

interface Config {
	app: {
		name: string
		navbar_brand: string
		username: string
		user_description: string
	}
	seo: {
		description: string
		twitter_handle?: string
		keywords: string
		author: string
		type: string
	}
	contact?: {
		email?: string
		discord?: {
			invite: string
			name: string
		}
	}
	navigation: {
		main_links: Array<{
			title: string
			url: string
			icon?: string
		}>
		footer_links?: Array<{
			title: string
			url: string
		}>
	}
	bsky?: {
		username: string
	}
}

async function question(
	rl: readline.Interface,
	query: string,
	defaultValue?: string,
): Promise<string> {
	const defaultPrompt = defaultValue ? ` (default: ${defaultValue})` : ''
	const answer = await new Promise<string>((resolve) =>
		rl.question(`${query}${defaultPrompt}: `, resolve),
	)
	return answer || defaultValue || ''
}

async function setupConfig() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	console.log(chalk.blue('\n=== Website Configuration Setup ===\n'))

	const config: Config = {
		app: {
			name: '',
			navbar_brand: '',
			username: '',
			user_description: '',
		},
		seo: {
			description: '',
			keywords: '',
			author: '',
			type: 'website',
		},
		navigation: {
			main_links: [],
			footer_links: [],
		},
	}

	// Basic App Information
	console.log(chalk.yellow('\nBasic Information:'))
	config.app.name = await question(
		rl,
		'Application name',
		`${username}'s Website`,
	)
	config.app.navbar_brand = await question(rl, 'Navbar brand', username)
	config.app.username = await question(rl, 'Username', username)
	config.app.user_description = await question(
		rl,
		'User description',
		`${username} is a creative person who loves to code and design.`,
	)

	// SEO Information
	console.log(chalk.yellow('\nSEO Information:'))
	config.seo.description = await question(
		rl,
		'SEO description',
		`${username} is a creative person who loves to code and design.`,
	)
	config.seo.twitter_handle = await question(
		rl,
		'Twitter handle',
		`@${username}`,
	)
	config.seo.keywords = await question(
		rl,
		'Keywords (comma-separated)',
		'web development, full-stack developer, creative coding, portfolio',
	)
	config.seo.author = await question(rl, 'Author', config.app.username)

	// Contact Information
	console.log(chalk.yellow('\nContact Information:'))
	const email = await question(rl, 'Email address (optional)')
	if (email) config.contact = { email }

	const setupDiscord = await question(
		rl,
		'Do you want to set up Discord? (y/N)',
	)
	if (setupDiscord.toLowerCase() === 'y') {
		config.contact = config.contact || {}
		config.contact.discord = {
			invite: await question(rl, 'Discord invite link'),
			name: await question(rl, 'Discord server name'),
		}
	}

	// Navigation
	console.log(chalk.yellow('\nNavigation Setup:'))
	console.log("Let's set up your main navigation links.")

	while (true) {
		const title = await question(
			rl,
			'\nEnter link title (or press enter to finish)',
		)
		if (!title) break

		const url = await question(rl, 'Enter URL')
		const icon = await question(rl, 'Enter Font Awesome icon class (optional)')

		const link: any = { title, url }
		if (icon) link.icon = icon

		config.navigation.main_links.push(link)
	}

	// Footer Links
	console.log(chalk.yellow('\nFooter Links:'))
	const setupFooter = await question(
		rl,
		'Do you want to set up footer links? (y/N)',
	)

	if (setupFooter.toLowerCase() === 'y') {
		while (true) {
			const title = await question(
				rl,
				'\nEnter footer link title (or press enter to finish)',
			)
			if (!title) break

			const url = await question(rl, 'Enter URL')
			config.navigation.footer_links?.push({ title, url })
		}
	}

	// Bluesky
	const setupBsky = await question(rl, '\nDo you want to set up Bluesky? (y/N)')
	if (setupBsky.toLowerCase() === 'y') {
		const username = await question(rl, 'Enter Bluesky username')
		config.bsky = { username }
	}

	rl.close()

	const websiteDataPath = path.join(os.tmpdir(), 'website-data.txt')
	const websiteData = fs.readFileSync(websiteDataPath, 'utf8')

	// Create directory if it doesn't exist
	fs.mkdirSync(path.dirname(websiteData), { recursive: true })

	// Save config
	fs.writeFileSync(websiteData, yaml.dump(config), 'utf8')

	console.log(chalk.green('\nConfiguration has been saved successfully!'))
	console.log(chalk.gray(`Configuration file location: ${websiteData}`))
}

if (require.main === module) {
	setupConfig().catch(console.error)
}
