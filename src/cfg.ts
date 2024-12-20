import fs from 'fs'
import yaml from 'js-yaml'
import { CONFIG_PATH } from '@/paths'
import { IConfig } from '@/interfaces/IConfig'


let config: IConfig

try {
	if (!fs.existsSync(CONFIG_PATH)) {
		throw new Error(`Config file not found at ${CONFIG_PATH}`)
	} else {
		const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8')
		config = yaml.load(fileContents) as IConfig
	}
} catch (error) {
	console.error('Error loading config:', error)
	throw error
}

export default config
