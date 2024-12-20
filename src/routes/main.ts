import { Router, Request, Response, NextFunction } from 'express'
import { render } from '@/utils/request'
import * as constants from '@/constants'
import linksSchema from '@/schemas/links.schema'
import { analyzeLogFile } from '@/scripts/analyzeRequests'
import { formatDistance, subDays } from 'date-fns'
import NodeCache from 'node-cache'
import { createContent } from '@/utils/content'
import { GitHubService } from '@/services/github'
import BskyService from '@/services/bsky'
import { getAllPosts } from '@/utils/blog'
import { generateBreadcrumbs, getAdjacentPages } from '@/utils/docs'
import { getDocsStructure } from '@/utils/docs'
import * as fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { parsePageFile } from '@/utils/pages'
import { PAGES_DIR } from '@/constants'

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
		description: 'Full-stack developer and designer specializing in web development, creative coding, and digital experiences',
		ogImage: {
			title: constants.APP_NAME,
			description: 'Full-stack Developer & Designer',
			author: 'Stella',
			tags: ['Web Development', 'Design', 'Creative Coding']
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

router.get('/stats', async (req: Request, res: Response) => {
	try {
		const timeframes = {
			'1h': 1 / 24,
			'24h': 1,
		}

		const selectedTimeframe = (req.query.timeframe as string) || '24h'
		const days = timeframes[selectedTimeframe as keyof typeof timeframes] || 1

		// Try to get cached data
		const cacheKey = `stats-${selectedTimeframe}`
		let analytics: any = statsCache.get(cacheKey)

		if (!analytics) {
			analytics = await analyzeLogFile('logs/requests.log', {
				days,
				minTime: 1000, // Track requests slower than 1 second
			})
			statsCache.set(cacheKey, analytics)
		}

		// Calculate additional metrics
		const successRate =
			((analytics.statusCodes[200] || 0) / analytics.totalRequests) * 100
		const errorRate =
			(Object.entries(analytics.statusCodes)
				.filter(([code]) => code.startsWith('5'))
				.reduce((acc, [, count]) => acc + (count as number), 0) /
				analytics.totalRequests) *
			100

		render(req, res, 'stats', {
			title: 'Site Statistics',
			description: 'Real-time analytics and statistics',
			analytics,
			timeframes,
			selectedTimeframe,
			successRate,
			errorRate,
			formatDistance,
		})
	} catch (error) {
		console.error('Error generating stats:', error)
		res.redirect('/')
	}
})

router.get('/about', async (req: Request, res: Response) => {
	try {
		const about = await content.parse('about.md')
		render(req, res, 'about', {
			title: 'About Me',
			description: about.excerpt || 'Learn more about my journey, skills, and experiences in web development and design',
			ogImage: {
				title: 'About Stella',
				description: 'Full-stack Developer & Designer',
				author: 'Stella',
				imageUrl: await new GitHubService().getProfileImage()
			},
			about,
		})
	} catch (error) {
		console.error('Error loading about page:', error)
		res.redirect('/')
	}
})

router.get('/me.jpg', async (req: Request, res: Response) => {
	// This returns a buffer
	const image = await new GitHubService().getProfileImage()
	res.redirect(image)
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
			description: doc.frontmatter.description || `Technical documentation and guides for ${category || 'all topics'}`,
			ogImage: {
				title: doc.frontmatter.title || 'Documentation',
				description: doc.frontmatter.description,
				author: 'Stella',
				tags: ['Documentation', category, 'Technical Guides'].filter(Boolean),
				date: doc.frontmatter.lastUpdated
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
				type: 'article'
		})
	} catch (error) {
		console.error('Error loading documentation:', error)
		res.redirect('/docs')
	}
})

router.get('/*', async (req: Request, res: Response, next: NextFunction) => {
	try {
		let requestPath = req.path.endsWith('/') ? 
			req.path + 'index' : 
			req.path

		requestPath = requestPath.replace(/^\//, '')
	
		const possiblePaths = [
			path.join(PAGES_DIR, requestPath + '.page'),
			path.join(PAGES_DIR, requestPath, 'index.page')
		]

		let filePath: string | null = null
		for (const p of possiblePaths) {
			if (fs.existsSync(p)) {
				filePath = p
				break
			}
		}

		if (!filePath) {
			return next()
		}

		const content = fs.readFileSync(filePath, 'utf-8')
		let config: any = {}
		let cleanContent: string = ''

		if (filePath.endsWith('.page')) {
			const parsed = await parsePageFile(content)
			config = parsed.config
			cleanContent = parsed.html
		} else {
			throw new Error('Unsupported file type')
		}

		render(req, res, 'dynamic-page', {
			title: config.seo?.title || path.basename(requestPath),
				description: config.seo?.description,
				content: cleanContent,
				css: config.css || [],
				js: config.js || [],
				...config
		})
	} catch (error) {
		console.error('Error loading dynamic page:', error)
		next(error)
	}
})

export default router
