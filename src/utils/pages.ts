import yaml from 'js-yaml'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSanitize from 'rehype-sanitize'
import { grid, hero, content as contentHTML, iframe, features, cta, gallery, testimonials, modal, modalButton, stats, faq, raw, defaultType } from './page_types'

function parseSection(type: string, content: string): string {
	switch (type) {
		case 'hero': return hero(content)
		case 'content': return contentHTML(content)
		case 'iframe': return iframe(content)
		case 'grid': return grid(content)
		case 'features': return features(content)
		case 'cta': return cta(content)
		case 'gallery': return gallery(content)
		case 'testimonials': return testimonials(content)
		case 'modal': return modal(content)
		case 'modal-button': return modalButton(content)
		case 'stats': return stats(content)
		case 'faq': return faq(content)
		case 'raw': return raw(content)
		default: return defaultType(content)
	}
}

async function parsePageFile(content: string) {
	const parts = content.split('---\n')

	if (parts.length < 3) {
		throw new Error(
			'Invalid .page file format. Expected frontmatter between --- markers.',
		)
	}

	const config = yaml.load(parts[1]) || {}
	const template = parts.slice(2).join('---\n').trim()
	const sections = template.split('::')

	let html = ''

	sections.forEach((section) => {
		const [type, ...content] = section.trim().split('\n')
		const sectionContent = content.join('\n').trim()
		html += parseSection(type, sectionContent)
	})

	return { config, html }
}

async function parseMarkdownFile(content: string) {
	const { data: frontmatter, content: markdownBody } = matter(content)

	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeSanitize)
		.use(rehypeSlug)
		.use(rehypeAutolinkHeadings, {
			behavior: 'append',
			content: {
				type: 'element',
				tagName: 'span',
				properties: { className: ['anchor-link'] },
				children: [{ type: 'text', value: ' #' }]
			}
		})
		//@ts-ignore
		.use(rehypeHighlight, {
			detect: true,
			ignoreMissing: true,
		})
		.use(rehypeStringify)

	const result = await processor.process(markdownBody)
	const body = String(result)

	const excerpt = markdownBody
		.split('\n\n')[0]
		.replace(/^#.*\n/, '')
		.trim()

	return {
		frontmatter: {
			...frontmatter,
			excerpt: frontmatter.excerpt || excerpt
		},
		body
	}
}

export { parsePageFile, parseSection, parseMarkdownFile }
