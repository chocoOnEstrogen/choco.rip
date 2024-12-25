import { Router, Request, Response, NextFunction } from 'express'
import { render } from '@/utils/request'
import * as constants from '@/constants'
import linksSchema from '@/schemas/links.schema'
import { formatDistance, subDays } from 'date-fns'
import NodeCache from 'node-cache'
import { createContent } from '@/utils/content'
import { GitHubService } from '@/services/github'
import { getAllPosts } from '@/utils/blog'
import { generateBreadcrumbs, getAdjacentPages } from '@/utils/docs'
import { getDocsStructure } from '@/utils/docs'
import * as fs from 'fs'
import path from 'path'
import { parseMarkdownFile, parsePageFile } from '@/utils/pages'
import { PAGES_DIR } from '@/paths'
import { IConfig } from '@/interfaces/IConfig'
import config from '@/cfg'

const content = createContent('content', {
	markdown: {
		gfm: true,
	},
	highlight: true,
	draft: true, // Show drafts in development
})

const router = Router()

// Initialize cache with 5-minute TTL
const statsCache = new NodeCache({ stdTTL: 300 })

router.get('/', async (req: Request, res: Response) => {
	const stats = await new GitHubService().getStats()
	const allPosts = await getAllPosts()
	const recentPosts = allPosts
		.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
		.slice(0, 3)

	render(req, res, 'index', {
		title: 'Home',
		description:
			'Full-stack developer and designer specializing in web development, creative coding, and digital experiences',
		ogImage: {
			title: constants.APP_NAME,
			description: 'Full-stack Developer & Designer',
			author: 'Stella',
			tags: ['Web Development', 'Design', 'Creative Coding'],
		},
		stats,
		recentPosts,
		formatDistance,
	})
})

router.get('/links', async (req: Request, res: Response) => {
	render(req, res, 'links', {
		title: 'Links',
		description: `Check out ${constants.USERNAME}'s links and social media profiles`,
	})
})

router.get('/links/:slug', async (req: Request, res: Response) => {
	try {
		const searchSlug = req.params.slug.toLowerCase()

		// Create a case-insensitive regex pattern
		const searchPattern = new RegExp(searchSlug, 'i')

		// Find all active links that match the pattern
		const matchingLinks = await linksSchema.find({
			active: true,
			$or: [{ title: searchPattern }],
		})

		if (matchingLinks.length === 0) {
			return render(req, res, 'link', {
				title: 'Link Not Found',
				link: null,
				matchingLinks: [],
			})
		}

		// If only one match is found, show the single link page
		if (matchingLinks.length === 1) {
			return render(req, res, 'link', {
				title: matchingLinks[0].title,
				description: matchingLinks[0].description,
				link: matchingLinks[0],
				matchingLinks: [],
			})
		}

		// If multiple matches are found, render the list view
		render(req, res, 'link', {
			title: 'Multiple Links Found',
			link: null,
			matchingLinks,
		})
	} catch (err) {
		console.error('Error fetching link:', err)
		res.redirect('/links')
	}
})

router.get('/about', async (req: Request, res: Response) => {
	try {
		const about = await content.parse('about.md')
		render(req, res, 'about', {
			title: 'About Me',
			description:
				about.excerpt ||
				'Learn more about my journey, skills, and experiences in web development and design',
			ogImage: {
				title: 'About Stella',
				description: 'Full-stack Developer & Designer',
				author: 'Stella',
				imageUrl: await new GitHubService().getProfileImage(),
			},
			about,
		})
	} catch (error) {
		console.error('Error loading about page:', error)
		res.redirect('/')
	}
})

router.get('/profile-image', async (req: Request, res: Response) => {
	const profileImage = config?.profile?.image
	if (profileImage && profileImage !== 'N/A') {
		const imageData = fs.readFileSync(profileImage)
		res.setHeader('Content-Type', `image/${profileImage.split('.').pop()}`)
		res.setHeader('Content-Length', imageData.length)
		res.send(imageData)
	} else {
		const defaultImagePath = path.join(__dirname, '..', '..', 'public', 'images', 'profile.png')
		const defaultImage = fs.readFileSync(defaultImagePath)
		res.setHeader('Content-Type', 'image/png')
		res.setHeader('Content-Length', defaultImage.length)
		res.send(defaultImage)
	}
})

router.get('/docs/:category?/:page?', async (req: Request, res: Response) => {
	try {
		const { category, page } = req.params
		const docPath =
			category && page ? `${category}/${page}` : category || 'index'

		const doc = await content.parse(`docs/${docPath}.md`)
		const structure = await getDocsStructure()

		// Generate breadcrumbs
		const breadcrumbs = generateBreadcrumbs(category, page)

		// Get previous and next pages
		const { previousPage, nextPage } = getAdjacentPages(
			structure,
			category,
			page,
		)

		render(req, res, 'docs/page', {
			layout: 'layouts/docs',
			title: doc.frontmatter.title || 'Documentation',
			description:
				doc.frontmatter.description ||
				`Technical documentation and guides for ${category || 'all topics'}`,
			ogImage: {
				title: doc.frontmatter.title || 'Documentation',
				description: doc.frontmatter.description,
				author: 'Stella',
				tags: ['Documentation', category, 'Technical Guides'].filter(Boolean),
				date: doc.frontmatter.lastUpdated,
			},
			doc,
			structure,
			breadcrumbs,
			previousPage,
			nextPage,
			category,
			page,
			path: req.path,
			lastUpdated: doc.frontmatter.lastUpdated || new Date().toISOString(),
			editUrl: `https://github.com/chocoOnEstrogen/choco.rip/edit/main/content/docs/${docPath}.md`,
			type: 'article',
		})
	} catch (error) {
		console.error('Error loading documentation:', error)
		res.redirect('/docs')
	}
})

export default router
