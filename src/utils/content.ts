import { readFile } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeHighlight from 'rehype-highlight'
import yaml from 'js-yaml'
import ini from 'ini'
import toml from 'toml'
import { marked } from 'marked'
import fs from 'fs/promises'
import hljs from 'highlight.js'

interface ContentOptions {
	markdown?: {
		remarkPlugins?: any[]
		rehypePlugins?: any[]
		gfm?: boolean
		marked?: boolean
	}
	highlight?: boolean
	draft?: boolean
}

interface ParsedContent {
	body: string
	excerpt?: string
	frontmatter: Record<string, any>
	_raw: string
	_type: string
	_path: string
}

export class Content {
	private basePath: string
	private options: ContentOptions

	constructor(basePath: string = 'content', options: ContentOptions = {}) {
		this.basePath = basePath
		this.options = {
			markdown: {
				gfm: true,
				marked: true,
				remarkPlugins: [],
				rehypePlugins: [],
				...options.markdown,
			},
			highlight: true,
			draft: process.env.NODE_ENV !== 'production',
			...options,
		}
	}

	async getFiles(path: string = ''): Promise<string[]> {
		const fullPath = join(process.cwd(), this.basePath, path)
		const files: string[] = []

		async function traverse(dir: string) {
			const entries = await fs.readdir(dir, { withFileTypes: true })

			for (const entry of entries) {
				const fullPath = join(dir, entry.name)
				const relativePath = fullPath.substring(process.cwd().length + 1)

				if (entry.isDirectory()) {
					await traverse(fullPath)
				} else {
					files.push(relativePath)
				}
			}
		}

		await traverse(fullPath)
		return files
	}

	async parse(path: string): Promise<ParsedContent> {
		const normalizedPath =
			path.startsWith(this.basePath) ?
				path.substring(this.basePath.length + 1)
			:	path

		const fullPath = join(process.cwd(), this.basePath, normalizedPath)
		const raw = await readFile(fullPath, 'utf-8')
		const extension = path.split('.').pop()?.toLowerCase()

		switch (extension) {
			case 'md':
			case 'mdx':
				return this.parseMarkdown(raw, path, extension)
			case 'json':
				return this.parseJson(raw, path)
			case 'yaml':
			case 'yml':
				return this.parseYaml(raw, path)
			case 'toml':
				return this.parseToml(raw, path)
			case 'ini':
			case 'conf':
				return this.parseIni(raw, path)
			default:
				throw new Error(`Unsupported file type: ${extension}`)
		}
	}

	private async parseMarkdown(
		content: string,
		path: string,
		type: string,
	): Promise<ParsedContent> {
		const {
			data: frontmatter,
			content: body,
			excerpt,
		} = matter(content, { excerpt: true })

		// Skip draft content in production
		if (!this.options.draft && frontmatter.draft) {
			throw new Error(`Draft content not available in production: ${path}`)
		}

		let parsedBody: string

		if (this.options.markdown?.marked) {
			marked.setOptions({
				gfm: this.options.markdown?.gfm,
				// @ts-ignore
				highlight: (code, lang) => {
					// Extract filename if present in data-filename attribute
					const filenameMatch = code.match(/data-filename="([^"]+)"/)
					const filename = filenameMatch ? filenameMatch[1] : null

					// Clean the code of any data attributes
					code = code.replace(/data-\w+="[^"]+"/g, '').trim()

					if (lang && hljs.getLanguage(lang)) {
						try {
							return hljs.highlight(code, { language: lang }).value
						} catch (err) {
							console.error('Failed to highlight:', err)
						}
					}
					return hljs.highlightAuto(code).value
				},
			})
			parsedBody = await marked(body)
		} else {
			const processor = unified()
				.use(remarkParse)
				.use(type === 'mdx' ? remarkMdx : () => {})
				.use(remarkFrontmatter)
				.use(this.options.markdown?.gfm ? remarkGfm : () => {})
				.use(this.options.markdown?.remarkPlugins || [])
				.use(remarkRehype)
				// @ts-ignore
				.use(rehypeHighlight, {
					detect: true,
					ignoreMissing: true,
				})
				.use(this.options.markdown?.rehypePlugins || [])
				.use(rehypeStringify)

			const result = await processor.process(body)
			parsedBody = String(result)
		}

		return {
			body: parsedBody,
			excerpt: excerpt || undefined,
			frontmatter,
			_raw: content,
			_type: type,
			_path: path,
		}
	}

	private parseJson(content: string, path: string): ParsedContent {
		const parsed = JSON.parse(content)
		return {
			body: JSON.stringify(parsed, null, 2),
			frontmatter: parsed,
			_raw: content,
			_type: 'json',
			_path: path,
		}
	}

	private parseYaml(content: string, path: string): ParsedContent {
		const parsed = yaml.load(content) as Record<string, any>
		return {
			body: yaml.dump(parsed),
			frontmatter: parsed,
			_raw: content,
			_type: 'yaml',
			_path: path,
		}
	}

	private parseToml(content: string, path: string): ParsedContent {
		const parsed = toml.parse(content)
		return {
			body: content,
			frontmatter: parsed,
			_raw: content,
			_type: 'toml',
			_path: path,
		}
	}

	private parseIni(content: string, path: string): ParsedContent {
		const parsed = ini.parse(content)
		return {
			body: content,
			frontmatter: parsed,
			_raw: content,
			_type: 'ini',
			_path: path,
		}
	}

	async query(
		path: string,
		query?: Record<string, any>,
	): Promise<ParsedContent[]> {
		const files = await this.getFiles(path)
		const contents = await Promise.all(
			files.map(async (file) => {
				try {
					return await this.parse(file)
				} catch (error) {
					if (
						error instanceof Error &&
						error.message.includes('Draft content')
					) {
						return null
					}
					throw error
				}
			}),
		)

		const filtered = contents.filter((content): content is ParsedContent => {
			if (!content) return false
			if (!query) return true

			return Object.entries(query).every(([key, value]) => {
				const contentValue = content.frontmatter[key]
				if (Array.isArray(value)) {
					return value.includes(contentValue)
				}
				return contentValue === value
			})
		})

		return filtered
	}
}

// Helper function to create a new Content instance
export function createContent(
	basePath?: string,
	options?: ContentOptions,
): Content {
	return new Content(basePath, options)
}

export async function getContent<T>(
	path: string,
	query?: Record<string, any>,
): Promise<T[]> {
	// Create content instance with correct base path
	const content = new Content('content') // Explicitly set base path to 'content'

	// Remove leading/trailing slashes and 'content' from path if present
	const normalizedPath = path
		.replace(/^\/+|\/+$/g, '')
		.replace(/^content\//, '')

	return (await content.query(normalizedPath, query)) as T[]
}
