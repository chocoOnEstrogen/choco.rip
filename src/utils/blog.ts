import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import slugify from 'slugify'
import { getContent } from '@/utils/content'

export interface BlogPost {
	slug: string
	title: string
	content: string
	excerpt: string
	author: string
	tags: string[]
	coverImage?: string
	status: 'draft' | 'published'
	publishedAt: Date
	featured: boolean
	readingTime: number
	seoTitle?: string
	seoDescription?: string
	createdAt: Date
	updatedAt: Date
	url: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export async function getAllPosts(includesDrafts = false): Promise<BlogPost[]> {
	try {
		const posts = await getContent<any>('blog')

		return posts
			.filter(
				(post) => includesDrafts || post.frontmatter.status === 'published',
			)
			.map((post) => {
				const pathParts = post._path.split('/').slice(-4)
				const [year, month, day, filename] = pathParts
				const slug = filename.replace('.md', '')
				const url = `${process.env.SITE_URL || 'http://localhost:9000'}/blog/${year}/${month}/${day}/${slug}`

				return {
					slug,
					title: post.frontmatter.title,
					content: post.body,
					excerpt: post.frontmatter.excerpt,
					author: post.frontmatter.author,
					tags: post.frontmatter.tags,
					coverImage: post.frontmatter.coverImage,
					status: post.frontmatter.status,
					publishedAt: new Date(`${year}-${month}-${day}`),
					featured: post.frontmatter.featured || false,
					readingTime: Math.ceil(post._raw.split(/\s+/).length / 200),
					seoTitle: post.frontmatter.seoTitle,
					seoDescription: post.frontmatter.seoDescription,
					createdAt:
						post.frontmatter.createdAt ?
							new Date(post.frontmatter.createdAt)
						:	new Date(),
					updatedAt:
						post.frontmatter.updatedAt ?
							new Date(post.frontmatter.updatedAt)
						:	new Date(),
					url,
				}
			})
			.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
	} catch (err) {
		console.error('Error getting posts:', err)
		return []
	}
}

export async function getPost(
	year: string,
	month: string,
	day: string,
	slug: string,
): Promise<BlogPost | null> {
	try {
		const filepath = path.join(BLOG_DIR, year, month, day, `${slug}.md`)
		const content = await fs.readFile(filepath, 'utf-8')
		const { data, content: markdown } = matter(content)

		const publishedAt = new Date(`${year}-${month}-${day}`)
		const htmlContent = sanitizeHtml(await marked(markdown))
		const wordCount = markdown.trim().split(/\s+/).length

		return {
			slug,
			title: data.title,
			content: htmlContent,
			excerpt: data.excerpt || '',
			author: data.author || 'choco',
			tags: (data.tags || []).map((tag: string) => tag.toLowerCase()),
			coverImage: data.coverImage,
			status: data.status || 'published',
			publishedAt,
			featured: data.featured || false,

			readingTime: Math.ceil(wordCount / 200),
			seoTitle: data.seoTitle || data.title,
			seoDescription: data.seoDescription || data.excerpt,
			createdAt: data.createdAt ? new Date(data.createdAt) : publishedAt,
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
			url: `${process.env.SITE_URL || 'http://localhost:9000'}/blog/${year}/${month}/${day}/${slug}`,
		}
	} catch (err) {
		console.error('Error reading post:', err)
		return null
	}
}

export async function savePost(post: Partial<BlogPost>): Promise<boolean> {
	try {
		const slug =
			post.slug || slugify(post.title!, { lower: true, strict: true })
		const date = post.publishedAt || new Date()

		const year = date.getFullYear().toString()
		const month = (date.getMonth() + 1).toString().padStart(2, '0')
		const day = date.getDate().toString().padStart(2, '0')

		// Create directory structure
		const postDir = path.join(BLOG_DIR, year, month, day)
		await fs.mkdir(postDir, { recursive: true })

		// Prepare frontmatter
		const frontmatter = {
			title: post.title,
			excerpt: post.excerpt,
			author: post.author || 'choco',
			tags: post.tags || [],
			coverImage: post.coverImage,
			status: post.status || 'draft',
			featured: post.featured || false,
			seoTitle: post.seoTitle,
			seoDescription: post.seoDescription,
			createdAt: post.createdAt || new Date(),
			updatedAt: new Date(),
		}

		// Create markdown content
		const fileContent = matter.stringify(post.content || '', frontmatter)

		// Save the file
		const filePath = path.join(postDir, `${slug}.md`)
		await fs.writeFile(filePath, fileContent)

		return true
	} catch (err) {
		console.error('Error saving post:', err)
		return false
	}
}

export async function deletePost(
	year: string,
	month: string,
	day: string,
	slug: string,
): Promise<boolean> {
	try {
		const filePath = path.join(BLOG_DIR, year, month, day, `${slug}.md`)
		await fs.unlink(filePath)
		return true
	} catch (err) {
		console.error('Error deleting post:', err)
		return false
	}
}
