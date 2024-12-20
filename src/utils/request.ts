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
	ogImage?: {
		title?: string
		description?: string
		author?: string
		date?: string
		tags?: string[]
		imageUrl?: string
	}
	[key: string]: any
}

export const render = async (
	req: Request,
	res: Response,
	template: string,
	data: RenderData = {},
	statusCode: number = 200,
) => {
	const ogImageData = {
		title: data.ogImage?.title || data.title || constants.APP_NAME,
		description:
			data.ogImage?.description ||
			data.description ||
			constants.DEFAULT_SEO.description,
		author: data.ogImage?.author || data.author || constants.DEFAULT_SEO.author,
		date:
			data.ogImage?.date ||
			(data.publishedAt ? new Date(data.publishedAt).toISOString() : undefined),
		tags:
			data.ogImage?.tags ||
			(data.tags ?
				Array.isArray(data.tags) ?
					data.tags
				:	[data.tags]
			:	[]),
		imageUrl: data.ogImage?.imageUrl || data.coverImage || data.image,
	}

	const ogImageUrl = new URL(`${req.protocol}://${req.get('host')}/og-image`)

	Object.entries(ogImageData).forEach(([key, value]) => {
		if (value !== undefined) {
			if (Array.isArray(value)) {
				value.forEach((item) =>
					ogImageUrl.searchParams.append(`${key}[]`, item),
				)
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
		fullTitle:
			data.title ? `${data.title} - ${constants.APP_NAME}` : constants.APP_NAME,
		canonicalUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
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
		seo: seoData,
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
