import path from 'path'
import os from 'os'

function slugify(str: string) {
	return str.toLowerCase().replace(/[^a-z0-9]/g, '-')
}

function getAppDataDir() {
	const osType = os.type()
	if (osType === 'Darwin') {
		return path.join(os.homedir(), 'Library', 'Application Support', slugify(APP_NAME))
	} else if (osType === 'Windows_NT') {
		return path.join(os.homedir(), 'AppData', 'Roaming', slugify(APP_NAME))
	} else {
		return path.join(os.homedir(), '.config', slugify(APP_NAME))
	}
}

export const APP_NAME = "Stella's Website"

export const DEFAULT_SEO = {
	description:
		'Full-stack developer and designer specializing in web development, creative coding, and digital experiences. Explore my portfolio, blog, and technical documentation.',
	twitterHandle: '@chocoOnEstrogen',
	keywords:
		'web development, full-stack developer, creative coding, portfolio, technical documentation, software engineering',
	author: 'Stella',
	type: 'website',
}

export const NAVBAR_BRAND = 'Stella'
export const USERNAME = 'Stella'
export const USER_DESCRIPTION =
	'Stella is a creative person who loves to code and design.'

const appdataDir = getAppDataDir()
export const PAGES_DIR = path.join(appdataDir, 'pages')
