import { join } from 'path'
import os from 'os'
import { existsSync, mkdirSync } from 'fs'
import { writeFile, readFile, unlink, stat, readdir } from 'fs/promises'
import crypto from 'crypto'
import path from 'path'
import sharp from 'sharp'

export class CacheService {
	private readonly cacheDir: string
	private readonly allowedExtensions = new Set([
		'.png',
		'.jpg',
		'.jpeg',
		'.gif',
		'.webp',
	])
	private readonly maxAge = 24 * 60 * 60 * 1000 // 24 hours
	private readonly maxSize = 10 * 1024 * 1024 // 10MB

	constructor() {
		this.cacheDir = join(__dirname, '../../.cache')
		// Ensure cache directory exists
		try {
			mkdirSync(this.cacheDir, { recursive: true })
		} catch (error) {
			console.error('Failed to create cache directory:', error)
		}
		this.startCleanupInterval()
	}

	private startCleanupInterval(): void {
		// Clean up old files every hour
		setInterval(() => this.cleanupOldFiles(), 60 * 60 * 1000)
	}

	private async cleanupOldFiles(): Promise<void> {
		try {
			const files = await this.listCacheFiles()
			const now = Date.now()

			for (const file of files) {
				const filePath = join(this.cacheDir, file)
				const stats = await stat(filePath)

				if (now - stats.mtimeMs > this.maxAge) {
					await this.removeFile(file)
				}
			}
		} catch (error) {
			console.error('Error cleaning up cache:', error)
		}
	}

	private async listCacheFiles(): Promise<string[]> {
		try {
			const files = await readdir(this.cacheDir)
			return files.filter((file) =>
				this.allowedExtensions.has(path.extname(file)),
			)
		} catch (error) {
			console.error('Error listing cache files:', error)
			return []
		}
	}

	public async saveFile(
		slug: string,
		content: Buffer,
		options: {
			format?: 'png' | 'jpeg' | 'webp'
			quality?: number
			width?: number
			height?: number
		} = {},
	): Promise<string> {
		const hash = this.generateHash(content)
		const ext = options.format || 'png'
		const fileName = `${slug}-${hash}.${ext}`
		const filePath = join(this.cacheDir, fileName)

		// Process image with sharp
		let image = sharp(content)

		// Apply transformations if specified
		if (options.width || options.height) {
			image = image.resize(options.width, options.height, {
				fit: 'inside',
				withoutEnlargement: true,
			})
		}

		// Set format and quality
		if (options.format === 'jpeg') {
			image = image.jpeg({ quality: options.quality || 80 })
		} else if (options.format === 'webp') {
			image = image.webp({ quality: options.quality || 80 })
		} else {
			image = image.png({ quality: options.quality || 100 })
		}

		try {
			// Save the processed image
			await image.toFile(filePath)
			return fileName
		} catch (error) {
			console.error('Error saving file:', error)
			throw error
		}
	}

	public async getFile(fileName: string): Promise<{
		path: string
		exists: boolean
		contentType: string
		size: number
	}> {
		const filePath = join(this.cacheDir, fileName)

		if (!this.isValidFilePath(filePath)) {
			throw new Error('Invalid file path')
		}

		const exists = existsSync(filePath)
		const ext = path.extname(fileName).toLowerCase()
		const contentType = this.getContentType(ext)
		const stats = exists ? await stat(filePath) : null
		const size = stats ? stats.size : 0

		return {
			path: filePath,
			exists,
			contentType,
			size,
		}
	}

	public async removeFile(fileName: string): Promise<void> {
		const filePath = join(this.cacheDir, fileName)

		if (!this.isValidFilePath(filePath)) {
			throw new Error('Invalid file path')
		}

		if (existsSync(filePath)) {
			await unlink(filePath)
		}
	}

	private generateHash(content: Buffer): string {
		return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8)
	}

	private isValidFilePath(filePath: string): boolean {
		const normalizedPath = path.normalize(filePath)
		return (
			normalizedPath.startsWith(this.cacheDir) &&
			this.allowedExtensions.has(path.extname(normalizedPath).toLowerCase())
		)
	}

	private getContentType(ext: string): string {
		const contentTypes: { [key: string]: string } = {
			'.png': 'image/png',
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.gif': 'image/gif',
			'.webp': 'image/webp',
		}
		return contentTypes[ext] || 'application/octet-stream'
	}
}
