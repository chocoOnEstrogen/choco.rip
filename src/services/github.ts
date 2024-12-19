import { Octokit } from 'octokit'
import NodeCache from 'node-cache'
import dotenv from 'dotenv'
import { generateRepoImage } from './image'

// Ensure environment variables are loaded
dotenv.config()

const cache = new NodeCache({ stdTTL: 300 }) // 5 minute cache

export class GitHubService {
	private octokit: Octokit
	private username: string

	constructor() {
		const token = process.env.GITHUB_TOKEN
		this.username = process.env.GITHUB_USERNAME || ''

		if (!token || !this.username) {
			throw new Error(
				'GitHub token or username not found in environment variables',
			)
		}

		this.octokit = new Octokit({
			auth: token,
		})
	}

	async getRepositories() {
		try {
			const cacheKey = `repos_${this.username}`
			const cached = cache.get(cacheKey)
			if (cached) return cached

			// Get repos and their languages in parallel
			const { data: repos } = await this.octokit.rest.repos.listForUser({
				username: this.username,
				sort: 'updated',
				per_page: 100,
				type: 'public',
			})

			// Fetch languages for all repos in parallel
			const reposWithDetails = await Promise.all(
				repos.map(async (repo: any) => {
					const [languages, imageUrl] = await Promise.all([
						this.getRepoLanguages(repo.name),
						generateRepoImage(
							repo.name,
							repo.description || 'No description available',
							repo.languages || {},
							repo.stargazers_count,
							repo.forks_count,
						).catch(() => null),
					])

					return {
						...repo,
						languages,
						imageUrl,
					}
				}),
			)

			cache.set(cacheKey, reposWithDetails)
			return reposWithDetails
		} catch (error) {
			console.error('Error in getRepositories:', error)
			throw error
		}
	}

	async getRepoLanguages(repo: string) {
		const cacheKey = `langs_${this.username}_${repo}`
		const cached = cache.get(cacheKey)
		if (cached) return cached

		const { data } = await this.octokit.rest.repos.listLanguages({
			owner: this.username,
			repo,
		})

		cache.set(cacheKey, data)
		return data
	}

	async getMostUsedLangs(len: number = 3) {
		const cached = cache.get('mostUsedLangs')
		if (cached) return cached

		const repos = await this.getRepositories()
		const langs = repos.map((repo: any) => repo.languages)

		// Merge all language objects into one
		const mergedLangs = langs.reduce(
			(acc: { [key: string]: number }, curr: { [key: string]: number }) => {
				Object.entries(curr).forEach(([lang, count]) => {
					acc[lang] = (acc[lang] || 0) + (count as number)
				})
				return acc
			},
			{},
		)

		// Calculate total bytes
		const totalBytes = Object.values(mergedLangs).reduce(
			(sum: any, count: any) => sum + count,
			0,
		)

		// Create sorted array with percentages
		const sortedLangs = Object.entries(mergedLangs)
			.map(([name, bytes]) => ({
				name,
				bytes,
				// @ts-ignore
				percentage: Number(((bytes / totalBytes) * 100).toFixed(1)),
			}))
			.sort((a: any, b: any) => b.bytes - a.bytes)
			.slice(0, len)

		cache.set('mostUsedLangs', sortedLangs)

		return sortedLangs
	}

	async getBranches(repo: string) {
		try {
			const cacheKey = `branches_${this.username}_${repo}`
			const cached = cache.get(cacheKey)
			if (cached) return cached

			const { data } = await this.octokit.rest.repos.listBranches({
				owner: this.username,
				repo,
				per_page: 100,
			})

			cache.set(cacheKey, data)
			return data
		} catch (error) {
			console.error(`Error fetching branches for ${repo}:`, error)
			// Return default branch array with 'main' if there's an error
			return [{ name: 'main', protected: false }]
		}
	}

	async getFileContent(repo: string, path: string, branch = 'main') {
		try {
			if (!path) return null

			const { data } = await this.octokit.rest.repos.getContent({
				owner: this.username,
				repo,
				path,
				ref: branch,
			})

			if ('content' in data) {
				return Buffer.from(data.content, 'base64').toString()
			}
			return null
		} catch (error) {
			if ((error as any).status === 404) {
				return null
			}
			console.error('Error fetching file content:', error)
			throw error
		}
	}

	async getStats() {
		const cacheKey = 'github_stats'
		const cached = cache.get(cacheKey)
		if (cached) return cached

		// Get user data in a single API call instead of separate calls for followers/stars
		const [userData, repos] = await Promise.all([
			this.octokit.rest.users.getAuthenticated(),
			this.getRepositories(),
		])

		// Calculate total stars from repos instead of using starred_url
		const totalStars = repos.reduce(
			(sum: number, repo: any) => sum + (repo.stargazers_count || 0),
			0,
		)

		const mostUsedLangs = await this.calculateMostUsedLangs(repos)

		const stats = {
			repos,
			followers: userData.data.followers,
			stars: totalStars,
			mostUsedLangs,
		}

		cache.set(cacheKey, stats)
		return stats
	}

	// Refactored to use existing repo data instead of making new API calls
	private async calculateMostUsedLangs(repos: any[], len: number = 3) {
		const cacheKey = `mostUsedLangs_${len}`
		const cached = cache.get(cacheKey)
		if (cached) return cached

		// Create a map to store language totals
		const langTotals: { [key: string]: number } = {}

		// Sum up language bytes across all repos
		for (const repo of repos) {
			const languages = repo.languages || {}
			Object.entries(languages).forEach(([lang, bytes]) => {
				langTotals[lang] = (langTotals[lang] || 0) + (bytes as number)
			})
		}

		const totalBytes = Object.values(langTotals).reduce(
			(sum, count) => sum + count,
			0,
		)

		const sortedLangs = Object.entries(langTotals)
			.map(([name, bytes]) => ({
				name,
				bytes,
				percentage: Number(((bytes / totalBytes) * 100).toFixed(1)),
			}))
			.sort((a, b) => b.bytes - a.bytes)
			.slice(0, len)

		cache.set(cacheKey, sortedLangs)
		return sortedLangs
	}

	async getCommits(repo: string, branch = 'main') {
		const { data } = await this.octokit.rest.repos.listCommits({
			owner: this.username,
			repo,
			sha: branch,
			per_page: 10,
		})
		return data
	}

	async getRepository(repo: string) {
		try {
			const cacheKey = `repo_${this.username}_${repo}`
			const cached = cache.get(cacheKey)
			if (cached) return cached

			const [repoData, branches] = await Promise.all([
				this.octokit.rest.repos
					.get({
						owner: this.username,
						repo,
					})
					.then((response: any) => response.data),
				this.getBranches(repo),
			])

			const data = {
				...repoData,
				branches,
			}

			cache.set(cacheKey, data)
			return data
		} catch (error) {
			console.error('Error fetching repository:', error)
			if ((error as any).status === 404) {
				return null // Return null for non-existent repos
			}
			throw error
		}
	}

	async getTreeContent(repo: string, path: string = '', branch = 'main') {
		try {
			const cacheKey = `tree_${this.username}_${repo}_${branch}_${path}`
			const cached = cache.get(cacheKey)
			if (cached) return cached

			// First get the reference to the branch
			const { data: refData } = await this.octokit.rest.git.getRef({
				owner: this.username,
				repo,
				ref: `heads/${branch}`,
			})

			// Get the tree using the commit SHA
			const { data: treeData } = await this.octokit.rest.git.getTree({
				owner: this.username,
				repo,
				tree_sha: refData.object.sha,
				recursive: '1', // Always get full tree
			})

			// Filter and format tree items
			let items = treeData.tree

			if (path) {
				// For directories, show immediate children
				// For files, this will be empty
				items = items.filter((item: any) => {
					const itemPath = item.path
					const pathParts = path.split('/').filter(Boolean)
					const itemParts = itemPath.split('/')

					// For directories, show immediate children
					if (itemParts.length === pathParts.length + 1) {
						return itemPath.startsWith(path + '/')
					}
					// For files, show exact match
					return itemPath === path
				})
			} else {
				// Show root level items only
				items = items.filter((item: any) => !item.path.includes('/'))
			}

			const formattedItems = items.map((item: any) => ({
				path: item.path,
				type: item.type,
				size: item.size || 0,
				sha: item.sha,
				url: item.url,
				lastModified: new Date().toISOString(), // GitHub API doesn't provide this directly
			}))

			cache.set(cacheKey, formattedItems)
			return formattedItems
		} catch (error) {
			console.error('Error fetching tree content:', error)
			throw error
		}
	}

	async getProfileImage() {
		try {
			const { data } = await this.octokit.rest.users.getAuthenticated()
			return data.avatar_url
		} catch (error) {
			console.error('Error fetching profile image:', error)
			throw error
		}
	}
}
