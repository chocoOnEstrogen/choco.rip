import { Router, Request, Response } from 'express'
import { generateOGImage } from '@/services/ogImage'
import { z } from 'zod'
import * as constants from '@/constants'
import cfg from '@/cfg'

const router = Router()

const ogImageSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().max(500).optional(),
	theme: z.enum(['light', 'dark']).optional(),
	template: z.enum(['default', 'minimal']).optional(),
	author: z.string().max(100).optional(),
	date: z.string().optional(),
	tags: z.array(z.string()).optional(),
	imageUrl: z.string().url().optional(),
})

//@ts-ignore
router.get('/', async (req: Request, res: Response) => {
	try {
		const params = ogImageSchema.parse({
			title: req.query.title || constants.APP_NAME,
			description: req.query.description || constants.DEFAULT_SEO.description,
			theme: req.query.theme || 'dark',
			template: req.query.template || 'default',
			author: req.query.author || constants.DEFAULT_SEO.author,
			date: req.query.date || new Date().toISOString(),
			tags: req.query.tags,
			imageUrl:
				req.query.imageUrl || `${req.protocol}://${req.get('host')}/profile-image`,
		})

		const imagePath = await generateOGImage({
			...params,
		})

		if (!imagePath) {
			return res.status(404).json({ error: 'Image not found' })
		}

		res.redirect(imagePath)
	} catch (error) {
		console.error('Error generating OG image:', error)
		res.status(400).json({ error: 'Invalid parameters' })
	}
})

export default router
