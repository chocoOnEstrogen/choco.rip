import { Router, Request, Response } from 'express'
import { render } from '@/utils/request'
import { getAllPosts, getPost } from '@/utils/blog'
import { formatDistance } from 'date-fns'

const router = Router()

// Blog index page with pagination
router.get('/', async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string) || 1
		const limit = 10

		const posts = await getAllPosts()
		const total = posts.length

		const paginatedPosts = posts.slice((page - 1) * limit, page * limit)
		const totalPages = Math.ceil(total / limit)

		render(req, res, 'blog/index', {
			title: 'Blog',
			description: 'Latest blog posts and articles',
			posts: paginatedPosts,
			formatDistance,
			pagination: {
				current: page,
				total: totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		})
	} catch (err) {
		console.error('Error loading blog posts:', err)
		res.redirect('/')
	}
})

// Individual blog post
router.get('/:year/:month/:day/:slug', async (req: Request, res: Response) => {
	try {
		const { year, month, day, slug } = req.params

		// Find post by slug and verify publish date matches URL
		const post = await getPost(year, month, day, slug)

		if (!post) {
			return res.status(404).render('error', {
				error: { message: 'Post not found' },
			})
		}

		// Increment view count
		await getPost(year, month, day, slug)

		// Get related posts based on tags
		const relatedPosts = (await getAllPosts())
			.filter((p: any) => p.slug !== slug)
			.filter((p: any) => p.tags.some((t: any) => post.tags.includes(t)))
			.slice(0, 3)

		render(req, res, 'blog/post', {
			title: post.seoTitle || post.title,
			description: post.seoDescription || post.excerpt,
			post,
			relatedPosts,
			formatDistance,
		})
	} catch (err) {
		console.error('Error loading blog post:', err)
		res.redirect('/blog')
	}
})

// Tag archive page
router.get('/tag/:tag', async (req: Request, res: Response) => {
	try {
		const { tag } = req.params
		const page = parseInt(req.query.page as string) || 1
		const limit = 10
		const skip = (page - 1) * limit

		const [posts, total] = await Promise.all([
			(await getAllPosts())
				.filter((p: any) => p.status === 'published')
				.filter((p: any) =>
					p.tags.some((t: any) => tag.toLowerCase().includes(t)),
				)
				.sort(
					(a: any, b: any) => b.publishedAt.getTime() - a.publishedAt.getTime(),
				)
				.slice(skip, skip + limit),
			(await getAllPosts())
				.filter((p: any) => p.status === 'published')
				.filter((p: any) =>
					p.tags.some((t: any) => tag.toLowerCase().includes(t)),
				).length,
		])

		const totalPages = Math.ceil(total / limit)

		render(req, res, 'blog/tag', {
			title: `Posts tagged "${tag}"`,
			description: `Browse all blog posts tagged with "${tag}"`,
			tag,
			formatDistance,
			posts,
			pagination: {
				current: page,
				total: totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		})
	} catch (err) {
		console.error('Error loading tagged posts:', err)
		res.redirect('/blog')
	}
})

router.get('/rss.xml', async (req: Request, res: Response) => {
	const posts = await getAllPosts()

	const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
	<rss version="2.0">
		<channel>
			<title>Choco's Blog</title>
			<description>Latest blog posts and articles</description>
			<link>https://choco.rip</link>
		</channel>
		${posts
			.map(
				(post: any) => `
			<item>
				<title>${post.title}</title>
				<description>${post.excerpt}</description>
				<link>https://choco.rip/blog/${post.year}/${post.month}/${post.day}/${post.slug}</link>
			</item>
		`,
			)
			.join('')}
	</rss>`

	res.set('Content-Type', 'application/rss+xml')
	res.send(rssFeed)
})

export default router
