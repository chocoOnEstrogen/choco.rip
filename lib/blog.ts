import { marked } from "marked"
import { gfmHeadingId } from "marked-gfm-heading-id"
import { mangle } from "marked-mangle"
import { format, parseISO } from "date-fns"
import { redis } from "./redis"

console.log("Configuring marked with plugins...")
marked.use(gfmHeadingId())
marked.use(mangle())
console.log("Marked plugins configured successfully")

// Cache TTL in seconds (1 hour)
const CACHE_TTL = 3600
console.log(`Cache TTL set to ${CACHE_TTL} seconds`)

interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  content: string
  html: string
  year: number
  month: number
}

interface BlogPostsResponse {
  posts: BlogPost[]
  metadata: {
    years: number[]
    months: Record<number, number[]>
    tags: string[]
  }
}

/**
 * Fetches the contents of a directory from GitHub
 * @param path The path to fetch from the repository
 * @returns The contents of the directory
 */
export async function fetchGitHubContents(path: string): Promise<any> {
  console.log(`Fetching GitHub contents for path: ${path}`)
  const url = `https://api.github.com/repos/chocoOnEstrogen/blog/contents/posts/${path}?ref=master`
  console.log(`Making request to: ${url}`)

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!response.ok) {
    console.error(`GitHub API error: ${response.status} ${response.statusText}`)
    throw new Error(`Failed to fetch GitHub contents: ${response.statusText}`)
  }

  const data = await response.json()
  console.log(`Successfully fetched GitHub contents for ${path}`)
  return data
}

/**
 * Fetches a file from GitHub
 * @param path The path to fetch from the repository
 * @returns The file contents
 */
export async function fetchGitHubFile(path: string): Promise<string> {
  console.log(`Fetching GitHub file: ${path}`)
  const url = `https://raw.githubusercontent.com/chocoOnEstrogen/blog/master/posts/${path}`
  console.log(`Making request to: ${url}`)

  const response = await fetch(url, {
    headers: {
      Accept: "text/plain",
    },
  })

  if (!response.ok) {
    console.error(`GitHub raw content error: ${response.status} ${response.statusText}`)
    throw new Error(`Failed to fetch GitHub file: ${response.statusText}`)
  }

  const content = await response.text()
  console.log(`Successfully fetched file: ${path} (${content.length} bytes)`)
  return content
}

/**
 * Extracts frontmatter from a markdown file
 * @param content The markdown content
 * @returns The frontmatter and content
 */
export function extractFrontmatter(content: string): {
  frontmatter: Record<string, any>
  content: string
} {
  console.log("Extracting frontmatter from content...")
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/
  const match = content.match(frontmatterRegex)

  if (!match) {
    console.error("No frontmatter found in content")
    throw new Error("No frontmatter found")
  }

  console.log("Parsing frontmatter fields...")
  const frontmatter = match[1]
    .split("\n")
    .reduce((acc: Record<string, any>, line: string) => {
      const [key, ...value] = line.split(":")
      if (key && value) {
        const trimmedKey = key.trim()
        const trimmedValue = value.join(":").trim()
        
        // Handle special cases
        if (trimmedKey === "tags") {
          acc[trimmedKey] = trimmedValue.split(",").map((tag: string) => tag.trim())
        } else if (trimmedKey === "date") {
          acc[trimmedKey] = trimmedValue
        } else {
          acc[trimmedKey] = trimmedValue
        }
        
        console.log(`Parsed frontmatter field: ${trimmedKey} = ${trimmedValue}`)
      }
      return acc
    }, {})

  const remainingContent = content.replace(frontmatterRegex, "")
  console.log("Successfully extracted frontmatter and content")
  return {
    frontmatter,
    content: remainingContent,
  }
}

/**
 * Parses a markdown file into HTML
 * @param content The markdown content
 * @returns The HTML content
 */
export async function parseMarkdown(content: string): Promise<string> {
  console.log(`Parsing markdown content (${content.length} bytes)...`)
  const html = await marked(content)
  console.log(`Successfully converted markdown to HTML (${html.length} bytes)`)
  return html
}

/**
 * Gets all blog posts with caching and metadata
 * @param year Optional year to filter posts
 * @param month Optional month to filter posts (1-12)
 * @returns An array of blog posts with metadata
 */
export async function getBlogPosts(year?: number, month?: number): Promise<BlogPostsResponse> {
  const cacheKey = `blog:posts:${year || 'all'}:${month || 'all'}`
  console.log(`Fetching blog posts with cache key: ${cacheKey}`)
  
  try {
    // Try to get from cache first
    console.log("Checking redis cache...")
    const cachedData = await redis.get<BlogPostsResponse>(cacheKey)
    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`)
      return cachedData
    }
    console.log(`Cache miss for ${cacheKey}, fetching from GitHub`)

    const years = await fetchGitHubContents("")
    console.log(`Found ${years.length} year directories`)
    
    const posts: BlogPost[] = []
    const yearsSet = new Set<number>()
    const months: Record<number, Set<number>> = {}
    const tags = new Set<string>()

    for (const yearDir of years) {
      if (yearDir.type === "dir" && /^\d{4}$/.test(yearDir.name)) {
        const yearNum = parseInt(yearDir.name)
        yearsSet.add(yearNum)
        console.log(`Processing year directory: ${yearNum}`)
        
        // Skip if we're filtering by year and this isn't it
        if (year && yearNum !== year) {
          console.log(`Skipping year ${yearNum} due to filter`)
          continue
        }

        console.log(`Processing year ${yearNum}`)
        const monthsInYear = await fetchGitHubContents(yearDir.name)
        for (const monthDir of monthsInYear) {
          if (monthDir.type === "dir" && /^\d{2}$/.test(monthDir.name)) {
            const monthNum = parseInt(monthDir.name)
            console.log(`Processing month directory: ${monthNum}`)
            
            // Skip if we're filtering by month and this isn't it
            if (month && monthNum !== month) {
              console.log(`Skipping month ${monthNum} due to filter`)
              continue
            }

            console.log(`Processing month ${monthNum} in year ${yearNum}`)
            if (!months[yearNum]) {
              months[yearNum] = new Set()
            }
            months[yearNum].add(monthNum)

            const postsInMonth = await fetchGitHubContents(`${yearDir.name}/${monthDir.name}`)
            console.log(`Found ${postsInMonth.length} posts in ${yearNum}-${monthNum}`)
            
            for (const post of postsInMonth) {
              if (post.name.endsWith(".md")) {
                console.log(`Processing post: ${post.name}`)
                const content = await fetchGitHubFile(`${yearDir.name}/${monthDir.name}/${post.name}`)
                console.log(`Fetched content for ${post.name} (${content.length} bytes)`)
                
                const { frontmatter, content: markdownContent } = extractFrontmatter(content)
                const html = await parseMarkdown(markdownContent)

                if (frontmatter.tags) {
                  console.log(`Processing tags: ${frontmatter.tags}`)
                  frontmatter.tags = formatTags(frontmatter.tags)
                }

                const blogPost: BlogPost = {
                  slug: post.name.replace(".md", ""),
                  title: frontmatter.title,
                  description: frontmatter.description,
                  date: frontmatter.date,
                  tags: frontmatter.tags || [],
                  content: markdownContent,
                  html: html,
                  year: yearNum,
                  month: monthNum
                }
                console.log(`Created blog post object for: ${blogPost.title}`)
                posts.push(blogPost)
              }
            }
          }
        }
      }
    }

    console.log(`Total posts processed: ${posts.length}`)
    console.log(`Unique tags found: ${tags.size}`)

    console.log("Building final response object...")
    const result = {
      posts: posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      metadata: {
        years: Array.from(yearsSet).sort((a, b) => b - a),
        months: Object.fromEntries(
          Object.entries(months).map(([year, monthSet]) => [
            year,
            Array.from(monthSet).sort((a, b) => b - a)
          ])
        ),
        tags: Array.from(tags).sort()
      }
    }

    // Cache the result
    console.log(`Caching results with key: ${cacheKey}`)
    await redis.set(cacheKey, result, CACHE_TTL)
    console.log(`Successfully cached results for ${CACHE_TTL} seconds`)
    
    return result
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    throw error
  }
}

function formatTags(tags: string[]): string[] {
    return tags.map((tag) => tag.trim().replace(/"/g, ''))
}

/**
 * Gets a single blog post by slug with caching
 * @param slug The slug of the blog post
 * @returns The blog post
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const cacheKey = `blog:post:${slug}`
  console.log(`Fetching blog post with slug: ${slug}`)
  
  try {
    // Try to get from cache first
    console.log(`Checking cache for key: ${cacheKey}`)
    const cachedData = await redis.get<BlogPost>(cacheKey)
    if (cachedData) {
      console.log(`Cache hit for post: ${slug}`)
      return cachedData
    }
    console.log(`Cache miss for post: ${slug}, fetching from GitHub`)

    // First, get all years
    const years = await fetchGitHubContents("")
    for (const yearDir of years) {
      if (yearDir.type === "dir" && /^\d{4}$/.test(yearDir.name)) {
        console.log(`Searching in year: ${yearDir.name}`)
        const months = await fetchGitHubContents(yearDir.name)
        for (const monthDir of months) {
          if (monthDir.type === "dir" && /^\d{2}$/.test(monthDir.name)) {
            console.log(`Searching in month: ${monthDir.name}`)
            const posts = await fetchGitHubContents(`${yearDir.name}/${monthDir.name}`)
            const post = posts.find((p: { name: string }) => p.name === `${slug}.md`)
            
            if (post) {
              console.log(`Found post: ${post.name}`)
              const content = await fetchGitHubFile(`${yearDir.name}/${monthDir.name}/${post.name}`)
              console.log(`Fetched content for ${post.name} (${content.length} bytes)`)
              
              const { frontmatter, content: markdownContent } = extractFrontmatter(content)
              const html = await parseMarkdown(markdownContent)

              const result = {
                slug,
                title: frontmatter.title,
                description: frontmatter.description,
                date: frontmatter.date,
                tags: formatTags(frontmatter.tags || []),
                content: markdownContent,
                html: html,
                year: parseInt(yearDir.name),
                month: parseInt(monthDir.name)
              }

              // Cache the result
              console.log(`Caching post with key: ${cacheKey}`)
              await redis.set(cacheKey, result, CACHE_TTL)
              console.log(`Successfully cached post for ${CACHE_TTL} seconds`)
              
              return result
            }
          }
        }
      }
    }

    console.log(`Post not found: ${slug}`)
    return null
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error)
    return null
  }
}

/**
 * Formats a date string
 * @param date The date string
 * @returns The formatted date
 */
export function formatDate(date: string): string {
  console.log(`Formatting date: ${date}`)
  const formatted = format(new Date(date), "MMMM d, yyyy")
  console.log(`Formatted date: ${formatted}`)
  return formatted
} 