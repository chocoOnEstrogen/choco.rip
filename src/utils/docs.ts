import { readdir } from 'fs/promises'
import { join } from 'path'
import { getContent } from './content'

interface DocPage {
	title: string
	slug: string
	category?: string
	order?: number
	url: string
	icon?: string
	showInNav?: boolean
}

interface DocCategory {
	title: string
	slug: string
	order?: number
	pages: DocPage[]
}

interface DocsStructure {
	categories: DocCategory[]
	pages: DocPage[]
}

export async function getDocsStructure(): Promise<DocsStructure> {
	const docs = await getContent<any>('docs')
	const structure: DocsStructure = {
		categories: [],
		pages: [],
	}

	// Group docs by category
	docs.forEach((doc) => {
		const { category, title, order = 999 } = doc.frontmatter
		const slug = doc._path.split('/').pop()?.replace('.md', '')

		if (!slug) return

		const page: DocPage = {
			title,
			slug,
			order,
			icon: doc.frontmatter.icon,
			url: `/docs/${category ? `${category}/${slug}` : slug}`,
			showInNav: doc.frontmatter.showInNav,
		}

		if (category) {
			let categoryObj = structure.categories.find((c) => c.slug === category)

			if (!categoryObj) {
				categoryObj = {
					title: category.charAt(0).toUpperCase() + category.slice(1),
					slug: category,
					order: order,
					pages: [],
				}
				structure.categories.push(categoryObj)
			}

			categoryObj.pages.push(page)
		} else {
			structure.pages.push(page)
		}
	})

	// Sort categories and pages
	structure.categories.sort((a, b) => (a.order || 999) - (b.order || 999))
	structure.categories.forEach((category) => {
		category.pages.sort((a, b) => (a.order || 999) - (b.order || 999))
	})
	structure.pages.sort((a, b) => (a.order || 999) - (b.order || 999))

	return structure
}

export function generateBreadcrumbs(category?: string, page?: string) {
	const breadcrumbs = [{ text: 'Documentation', url: '/docs', active: false }]

	if (category) {
		breadcrumbs.push({
			text: category.charAt(0).toUpperCase() + category.slice(1),
			url: `/docs/${category}`,
			active: !page,
		})
	}

	if (page) {
		breadcrumbs.push({
			text: page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' '),
			url: `/docs/${category}/${page}`,
			active: true,
		})
	}

	return breadcrumbs
}

export function getAdjacentPages(
	structure: DocsStructure,
	category?: string,
	page?: string,
) {
	let previousPage: DocPage | null = null
	let nextPage: DocPage | null = null

	if (!category && !page) {
		return { previousPage, nextPage }
	}

	// Flatten all pages into a single array
	const allPages = [
		...structure.pages,
		...structure.categories.flatMap((cat) => cat.pages),
	].sort((a, b) => (a.order || 999) - (b.order || 999))

	// Find current page index
	const currentIndex = allPages.findIndex((p) => {
		if (category && page) {
			return p.url === `/docs/${category}/${page}`
		}
		return p.url === `/docs/${category}`
	})

	if (currentIndex > 0) {
		previousPage = allPages[currentIndex - 1]
	}

	if (currentIndex < allPages.length - 1) {
		nextPage = allPages[currentIndex + 1]
	}

	return { previousPage, nextPage }
}

// Helper function to validate doc path
export function isValidDocPath(path: string): boolean {
	// Add any validation logic you need
	return /^[a-zA-Z0-9-_/]+$/.test(path)
}

// Helper function to get full doc path
export function getDocPath(category?: string, page?: string): string {
	if (category && page) {
		return `${category}/${page}`
	}
	return category || 'index'
}
