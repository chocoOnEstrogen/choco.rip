import NodeCache from 'node-cache'

const iconCache = new NodeCache({ stdTTL: 3600 }) // Cache for 1 hour

interface IconMetadata {
	changes: string[]
	ligatures: string[]
	search: {
		terms: string[]
	}
	styles: string[]
	unicode: string
	label: string
	svg: {
		[key: string]: {
			last_modified: number
			raw: string
			viewBox: number[]
			width: number
			height: number
			path: string
		}
	}
	free: string[]
	private?: boolean
}

interface IconsMetadata {
	[key: string]: IconMetadata
}

export async function getFontAwesomeIcons() {
	// Check cache first
	const cachedIcons = iconCache.get('fa-icons')
	if (cachedIcons) {
		return cachedIcons as IconsMetadata
	}

	try {
		const icons: IconsMetadata = require('@/data/fontawesome-icons.json')

		// Process icons to only include free ones
		const processedIcons = Object.entries(icons).reduce((acc, [name, data]) => {
			if (data.free?.length > 0 && !data.private) {
				acc[name] = data
			}
			return acc
		}, {} as IconsMetadata)

		// Cache the processed icons
		iconCache.set('fa-icons', processedIcons)
		return processedIcons
	} catch (error) {
		console.error('Error fetching Font Awesome icons:', error)
		return {}
	}
}

export function getIconClass(name: string, style: string = 'solid'): string {
	const prefix =
		style === 'brands' ? 'fab'
		: style === 'regular' ? 'far'
		: 'fas'
	return `${prefix} fa-${name}`
}
