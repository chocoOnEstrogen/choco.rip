import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export const pageFunctions = {
    // File operations
    async readFile(filepath: string) {
        try {
            const content = await fs.readFile(filepath, 'utf-8')
            return content
        } catch (error: any) {
            return `Error reading file: ${error.message}`
        }
    },

    async readDir(dirpath: string) {
        try {
            const absolutePath = path.isAbsolute(dirpath) 
                ? dirpath 
                : path.join(process.cwd(), dirpath)
            
            const files = await fs.readdir(absolutePath)
            const filteredFiles = files
                .filter(file => {
                    // Filter out system files and non-image files
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
                    const isNotHidden = !file.startsWith('.')
                    return isImage && isNotHidden
                })
                .sort() // Sort alphabetically
            
            return JSON.stringify(filteredFiles)
        } catch (error: any) {
            return `Error reading directory: ${error.message}`
        }
    },

    // Content operations
    async listPosts(postsDir: string = 'content/posts', limit: number = 5) {
        try {
            const files = await fs.readdir(postsDir)
            const posts = await Promise.all(
                files
                    .filter(file => file.endsWith('.md'))
                    .slice(0, limit)
                    .map(async file => {
                        const content = await fs.readFile(path.join(postsDir, file), 'utf-8')
                        const { data } = matter(content)
                        return `- [${data.title}](/posts/${file.replace('.md', '')})`
                    })
            )
            return posts.join('\n')
        } catch (error: any) {
            return `Error listing posts: ${error.message}`
        }
    },

    // Utility functions
    formatDate(date: string, format: string = 'en-US') {
        return new Date(date).toLocaleDateString(format, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    },

    async getGitLastModified(filepath: string) {
        try {
            const stats = await fs.stat(filepath)
            return this.formatDate(stats.mtime.toString())
        } catch (error: any) {
            return `Error getting last modified date: ${error.message}`
        }
    },

    // Loop functions
    for(start: string, end: string, template: string) {
        const result = []
        const startNum = parseInt(start)
        const endNum = parseInt(end)
        
        for (let i = startNum; i <= endNum; i++) {
            result.push(template.replace(/\$i/g, i.toString()))
        }
        
        return result.join('\n')
    },

    forEach(items: any, template: string) {
        try {
            let itemArray;
            
            // If items is a variable reference (starts with $), return error
            if (typeof items === 'string' && items.startsWith('$')) {
                return `Error: Variable '${items}' not resolved before forEach`;
            }
            
            // If items is already an array, use it directly
            if (Array.isArray(items)) {
                itemArray = items;
            }
            // If it's a JSON string, parse it
            else if (typeof items === 'string' && (items.startsWith('[') || items.startsWith('{'))) {
                try {
                    itemArray = JSON.parse(items);
                    if (!Array.isArray(itemArray)) {
                        itemArray = [itemArray];
                    }
                } catch (e: any) {
                    console.error("JSON parse error:", e);
                    return `Error parsing JSON: ${e.message}`;
                }
            }
            // If it's a comma-separated string
            else if (typeof items === 'string') {
                itemArray = items.split(',').map(item => item.trim());
            }
            else {
                return 'Error: Invalid input type';
            }
            
            if (!itemArray || itemArray.length === 0) {
                return '';
            }
            
            return itemArray
                .filter(Boolean)
                .map(item => {
                    let processed = template;
                    
                    if (typeof item === 'object' && item !== null) {
                        for (const [key, value] of Object.entries(item)) {
                            const regex = new RegExp(`\\$${key}`, 'g');
                            processed = processed.replace(regex, value?.toString() || '');
                        }
                    } else {
                        processed = processed.replace(/\$item/g, item.toString().trim());
                    }
                    
                    return processed;
                })
                .join('\n');
            
        } catch (error: any) {
            console.error('ForEach error:', error);
            return `Error in forEach: ${error.message}`;
        }
    },

    repeat(times: string, template: string) {
        const count = parseInt(times)
        return Array(count)
            .fill(template)
            .join('\n')
    },

    // Text transformation functions
    capitalize(text: string) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    },

    slugify(text: string) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
    },

    // Math functions
    math(expression: string) {
        try {
            // Using Function instead of eval for better security
            return new Function(`return ${expression}`)()
        } catch (error: any) {
            return `Error evaluating math: ${error.message}`
        }
    },

    // Time-based functions
    timeAgo(date: string) {
        const periods = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        }
        
        const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
        
        for (const [period, seconds] of Object.entries(periods)) {
            const interval = Math.floor(diff / seconds)
            if (interval >= 1) {
                return `${interval} ${period}${interval !== 1 ? 's' : ''} ago`
            }
        }
        return 'just now'
    },

    // Content enhancement
    async tableOfContents(content: string) {
        const headingRegex = /^#{1,6}\s+(.+)$/gm
        const matches = [...content.matchAll(headingRegex)]
        const toc = matches.map(match => {
            const level = match[0].indexOf(' ')
            const text = match[1]
            const indent = '  '.repeat(level - 1)
            const slug = this.slugify(text)
            return `${indent}- [${text}](#${slug})`
        })
        return toc.join('\n')
    },

    // Environment variables
    env(key: string, defaultValue: string = '') {
        return process.env[key] || defaultValue
    },

    // Random content generation
    random(...items: string[]) {
        return items[Math.floor(Math.random() * items.length)]
    },

    split(str: string, delimiter: string = ',') {
        if (Array.isArray(str)) {
            return str // If already an array, return it directly
        }
        
        try {
            // Try parsing as JSON first
            const parsed = JSON.parse(str)
            return Array.isArray(parsed) ? parsed : [str]
        } catch {
            // If JSON parsing fails, split the string
            return str.toString().split(delimiter).map(item => item.trim())
        }
    },

    length(arr: any) {
        try {
            // If it's a JSON string, parse it first
            if (typeof arr === 'string' && (arr.startsWith('[') || arr.startsWith('{'))) {
                const parsed = JSON.parse(arr)
                return Array.isArray(parsed) ? parsed.length.toString() : '0'
            }
            // If it's already an array
            if (Array.isArray(arr)) {
                return arr.length.toString()
            }
            // If it's a comma-separated string
            if (typeof arr === 'string') {
                return arr.split(',').length.toString()
            }
            return '0'
        } catch (error) {
            console.error('Length error:', error)
            return '0'
        }
    }
} 