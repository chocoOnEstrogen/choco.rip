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
import { pageFunctions } from './page_functions'
import config from '@/cfg'

// Store for in-page variables
const inPageVars: Record<string, any> = {};

async function processVariables(content: string) {
	const variablePattern = /\{\{\s*([\$@])([a-zA-Z0-9_.]+)\s*\}\}/g
	let result = content

	for (const match of result.matchAll(variablePattern)) {
		const [fullMatch, prefix, path] = match
		const parts = path.split('.')

		if (!config.variables) return result
		
		// Handle different variable types
		let value: any
		if (prefix === '@') {
			// Config variables
			value = config.variables
			for (const part of parts) {
				value = value?.[part]
			}
		} else if (prefix === '$') {
			// In-page variables
			value = inPageVars[parts[0]]
			if (parts.length > 1) {
				for (const part of parts.slice(1)) {
					value = value?.[part]
				}
			}
		}

		result = result.replace(fullMatch, value?.toString() ?? '')
	}

	return result
}

async function processFunctionCalls(content: string): Promise<string> {
	const functionPattern = /\{\{\s*([a-zA-Z]+)\s+([^}]+?)\s*\}\}/g
	let result = content

	for (const match of result.matchAll(functionPattern)) {
		const [fullMatch, funcName, argsStr] = match
		if (funcName in pageFunctions) {
			// Split args by spaces, but respect quotes
			const args = argsStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []
			const cleanedArgs = args.map(arg => {
				// Handle variable references in arguments
				if (arg.startsWith('$')) {
					const varName = arg.slice(1)
					return inPageVars[varName] ?? arg
				}
				return arg.replace(/^['"]|['"]$/g, '')
			})
			
			try {
				const replacement = await (pageFunctions[funcName as keyof typeof pageFunctions] as Function)(...cleanedArgs)
				result = result.replace(fullMatch, replacement?.toString() ?? '')
			} catch (error: any) {
				console.error(`Error in ${funcName}:`, error)
				result = result.replace(fullMatch, `Error: ${error.message}`)
			}
		}
	}
	
	return result
}

async function processInPageVariables(content: string): Promise<string> {
	const lines = content.split('\n')
	let result = []

	for (const line of lines) {
		// Match variable declarations: $name = value
		const varMatch = line.trim().match(/^\$([a-zA-Z0-9_]+)\s*=\s*(.+)$/)
		if (varMatch) {
			const [_, name, expression] = varMatch
			try {
				// Handle function calls in assignments
				const funcMatch = expression.match(/([a-zA-Z]+)\s+(.+)/)
				if (funcMatch) {
					const [_, funcName, argsStr] = funcMatch
					if (funcName in pageFunctions) {
						const args = argsStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []
						const cleanedArgs = args.map(arg => {
							const trimmed = arg.trim()
							// Handle variable references in arguments
							if (trimmed.startsWith('$')) {
								return inPageVars[trimmed.slice(1)]?.toString() ?? ''
							}
							return trimmed.replace(/^['"]|['"]$/g, '')
						})
						inPageVars[name] = await (pageFunctions[funcName as keyof typeof pageFunctions] as Function)(...cleanedArgs)
					}
				} else {
					// Direct value assignment
					inPageVars[name] = expression.trim()
				}
				continue
			} catch (error) {
				console.error(`Error processing variable ${name}:`, error)
			}
		}
		result.push(line)
	}

	// Replace variable references in content
	let processedContent = result.join('\n')
	const varPattern = /\{\{\s*\$([a-zA-Z0-9_]+)\s*\}\}/g
	processedContent = processedContent.replace(varPattern, (_, name) => {
		return inPageVars[name]?.toString() ?? ''
	})

	return processedContent
}

async function parseSection(type: string, content: string): Promise<string> {
	let processedContent = content
	processedContent = await processVariables(processedContent)
	processedContent = await processFunctionCalls(processedContent)
	
	switch (type) {
		case 'hero': return hero(processedContent)
		case 'content': return contentHTML(processedContent)
		case 'iframe': return iframe(processedContent)
		case 'grid': return grid(processedContent)
		case 'features': return features(processedContent)
		case 'cta': return cta(processedContent)
		case 'gallery': return gallery(processedContent)
		case 'testimonials': return testimonials(processedContent)
		case 'modal': return modal(processedContent)
		case 'modal-button': return modalButton(processedContent)
		case 'stats': return stats(processedContent)
		case 'faq': return faq(processedContent)
		case 'raw': return raw(processedContent)
		default: return defaultType(processedContent)
	}
}

async function parsePageFile(content: string) {
	const normalizedContent = content.replace(/\r\n/g, '\n')
	const parts = normalizedContent.split('---\n')

	if (parts.length < 3) {
		throw new Error('Invalid .page file format. Expected frontmatter between --- markers.')
	}

	// Clear any previous in-page variables
	Object.keys(inPageVars).forEach(key => delete inPageVars[key])

	const config = yaml.load(parts[1]) || {}
	let template = parts.slice(2).join('---\n').trim()
	
	
	// Process in-page variables before other processing
	template = await processInPageVariables(template)
	
	
	// If the content doesn't start with ::, wrap it in raw section
	const processedTemplate = template.startsWith('::') ? template : `::raw\n${template}`
	const sections = processedTemplate.split('::').filter(Boolean)

	let html = ''
	for (const section of sections) {
		const [type, ...content] = section.trim().split('\n')
		const sectionContent = content.join('\n').trim()
		html += await parseSection(type, sectionContent)
	}

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
