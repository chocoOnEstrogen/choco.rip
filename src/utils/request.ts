import { Request, Response } from 'express'
import * as constants from '@/constants'
import linksSchema from '@/schemas/links.schema'
import NodeCache from 'node-cache'
import { ILink } from '@/interfaces/ILink'
import config from '@/cfg'

const linksCache = new NodeCache({
	stdTTL: 60 * 60,
})

interface RenderData {
	title?: string
	description?: string
	image?: string
	twitterHandle?: string
	author?: string
	date?: string
	tags?: string[]
	imageUrl?: string
	[key: string]: any
}

export const render = async (
	req: Request,
	res: Response,
	template: string,
	data: RenderData = {},
	statusCode: number = 200,
) => {
	const ogImageParams = new URLSearchParams({
		title: data.title || constants.APP_NAME,
		description: data.description || constants.DEFAULT_SEO.description,
		theme: 'dark',
	})

	if (data.author) ogImageParams.append('author', data.author)
	if (data.date) ogImageParams.append('date', data.date)
	if (data.tags && Array.isArray(data.tags)) {
		data.tags.forEach((tag) => ogImageParams.append('tags[]', tag))
	}
	if (data.imageUrl) ogImageParams.append('imageUrl', data.imageUrl)

	const seoData = {
		description: data.description || constants.DEFAULT_SEO.description,
		image: `${req.protocol}://${req.get('host')}/og-image?${ogImageParams.toString()}`,
		twitterHandle: data.twitterHandle || constants.DEFAULT_SEO.twitterHandle,
	}

	let links = linksCache.get<ILink[]>('links')

	if (!links || links.length === 0) {
		links = await linksSchema
			.find({
				type: 'social',
				active: true,
			})
			.sort({ priority: -1 })
		linksCache.set('links', links)
	}

	const renderOptions = {
		...data,
		constants,
		title:
			data.title ? `${data.title} - ${constants.APP_NAME}` : constants.APP_NAME,
		links,
		cfg: config,
		seo: {
			...seoData,
			fullTitle:
				data.title ?
					`${data.title} - ${constants.APP_NAME}`
				:	constants.APP_NAME,
			canonicalUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
		},
		path: req.path,
		query: req.query,
	}

	res.status(statusCode).render(template, renderOptions)
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
			error: process.env.NODE_ENV === 'development' ? error : {},
			status: error.status || 500,
			message: error.message || 'Internal Server Error',
		},
		statusCode,
	)
}
