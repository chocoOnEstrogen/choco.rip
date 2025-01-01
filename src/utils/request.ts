import { Request, Response } from 'express'
import * as constants from '@/constants'
import linksSchema from '@/schemas/links.schema'
import NodeCache from 'node-cache'
import { ILink } from '@/interfaces/ILink'
import config from '@/cfg'
import fs from 'fs'

// Consolidated cache configuration
const CACHE_TTL = 60 * 60 // 1 hour in seconds

// Single cache instance with namespaced keys
const cache = new NodeCache({ stdTTL: CACHE_TTL })

// Common interfaces
interface CacheEntry {
	src: string
	content: string | null
	isFile: boolean
	minified?: boolean
}

interface RenderData {
	title?: string
	description?: string
	ogImage?: {
		title?: string
		description?: string
		author?: string
		date?: string
		tags?: string[]
		imageUrl?: string
	}
	js?: string | string[]
	css?: string | string[]
	[key: string]: any
}

// Optimized minification functions
function minifyJS(code: string): string {
	return code
		.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
		.replace(/\s*([+\-*/%=<>!&|,{}()[\];:?])\s*/g, '$1')
		.replace(/\s+/g, ' ')
		.replace(/\s*\.\s*/g, '.')
		.trim()
}

function minifyCSS(code: string): string {
	return code
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/\s*([{}:;,])\s*/g, '$1')
		.replace(/\s+/g, ' ')
		.trim()
}

// Generic asset handler
async function handleAsset(
	type: 'js' | 'css',
	action: 'add' | 'get' | 'remove',
	cacheKey: string,
	files?: string | string[]
): Promise<CacheEntry[]> {
	const minify = type === 'js' ? minifyJS : minifyCSS
	const cacheNamespace = `${type}:${cacheKey}`

	switch (action) {
		case 'get':
			return cache.get<CacheEntry[]>(cacheNamespace) || []

		case 'add':
			if (!files) return []
			
			const fileArray = Array.isArray(files) ? files : [files]
			const entries = await Promise.all(
				fileArray.map(async (file) => {
					const isWeb = file.startsWith('http')
					if (isWeb) {
						return {
							src: file,
							content: "",
							isFile: false,
							minified: false
						}
					}

					try {
						const content = fs.readFileSync(file, 'utf-8')
						return {
							src: file,
							content: process.env.NODE_ENV === 'production' ? minify(content) : content,
							isFile: true,
							minified: process.env.NODE_ENV === 'production'
						}
					} catch (err) {
						console.warn(`Failed to read ${type} file: ${file}`, err)
						return null
					}
				})
			)

			const validEntries = entries.filter((entry): entry is NonNullable<typeof entries[number]> => entry !== null)
			if (validEntries.length > 0) {
				cache.set(cacheNamespace, validEntries)
			}
			return validEntries

		case 'remove':
			cache.del(cacheNamespace)
			return []
	}
}

export const render = async (
	req: Request,
	res: Response,
	template: string,
	data: RenderData = {},
	statusCode: number = 200,
) => {
	const cacheKey = req.originalUrl

	// Clear all caches if version parameter is present
	if (req.query['v']) {
		cache.flushAll()
	}

	// Handle links
	let links = cache.get<ILink[]>('links')
	if (!links || links.length === 0) {
		links = await linksSchema
			.find({ type: 'social', active: true })
			.sort({ priority: -1 })
		cache.set('links', links)
	}

	// Handle assets
	const [pageScripts, pageStyles] = await Promise.all([
		data.js ? handleAsset('js', 'get', cacheKey).then(cached => 
			cached.length ? cached : handleAsset('js', 'add', cacheKey, data.js)
		) : Promise.resolve([]),
		data.css ? handleAsset('css', 'get', cacheKey).then(cached => 
			cached.length ? cached : handleAsset('css', 'add', cacheKey, data.css)
		) : Promise.resolve([])
	])

	// SEO data preparation
	const ogImageData = {
		title: data.ogImage?.title || data.title || constants.APP_NAME,
		description: data.ogImage?.description || data.description || constants.DEFAULT_SEO.description,
		author: data.ogImage?.author || data.author || constants.DEFAULT_SEO.author,
		date: data.ogImage?.date || (data.publishedAt ? new Date(data.publishedAt).toISOString() : undefined),
		tags: data.ogImage?.tags || (data.tags ? (Array.isArray(data.tags) ? data.tags : [data.tags]) : []),
		imageUrl: data.ogImage?.imageUrl || data.coverImage || data.image,
	}

	const ogImageUrl = new URL(`${req.protocol}://${req.get('host')}/og-image`)
	Object.entries(ogImageData).forEach(([key, value]) => {
		if (value !== undefined) {
			if (Array.isArray(value)) {
				value.forEach((item) => ogImageUrl.searchParams.append(`${key}[]`, item))
			} else {
				ogImageUrl.searchParams.set(key, value.toString())
			}
		}
	})

	const seoData = {
			description: data.description || constants.DEFAULT_SEO.description,
			image: ogImageUrl.toString(),
			twitterHandle: data.twitterHandle || constants.DEFAULT_SEO.twitterHandle,
			keywords: data.keywords || constants.DEFAULT_SEO.keywords,
			author: data.author || constants.DEFAULT_SEO.author,
			type: data.type || constants.DEFAULT_SEO.type,
			fullTitle: data.title ? `${data.title} - ${constants.APP_NAME}` : constants.APP_NAME,
			canonicalUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
	}

	res.status(statusCode).render(template, {
		...data,
		constants,
		title: seoData.fullTitle,
		links,
		cfg: config,
		config,
		seo: seoData,
		path: req.path,
		query: req.query,
		js: pageScripts,
		css: pageStyles,
	})
}

export const error = async (
	req: Request,
	res: Response,
	error: any,
	statusCode: number = 500,
) => {
	console.error('Error:', error)
	render(
		req,
		res,
		'error',
		{
			title: 'Error',
			details: process.env.NODE_ENV === 'development' ? error : {},
			status: error.status || 500,
			message: error.message || 'Internal Server Error',
		},
		statusCode,
	)
}
