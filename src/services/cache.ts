import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { writeFile, readFile, unlink, stat, readdir } from 'fs/promises'
import crypto from 'crypto'
import path from 'path'
import sharp from 'sharp'
import NodeCache from 'node-cache'
import { gzip, ungzip } from 'node-gzip'

// Type definitions for different cache types
type CacheType = 'image' | 'json' | 'text' | 'buffer' | 'html'

interface BaseCacheOptions {
	ttl?: number
	checkPeriod?: number
	maxSize?: number
	cacheDir?: string
	compression?: boolean
}

interface CacheItem<T> {
	data: T
	type: CacheType
	createdAt: number
	metadata?: Record<string, any>
}

interface ImageOptions {
	format?: 'png' | 'jpeg' | 'webp'
	quality?: number
	width?: number
	height?: number
	metadata?: Record<string, any>
}

interface CacheStats {
	hits: number
	misses: number
	keys: number
	memorySize: number
	fileSize: number
	byType: Record<CacheType, number>
}

export class CacheService {
	private readonly cacheDir: string
	private readonly memCache: NodeCache
	private readonly maxAge: number
	private readonly maxSize: number
	private readonly compression: boolean
	public readonly allowedExtensions: Set<string>
	private stats: CacheStats
	
	private readonly contentTypes: Record<CacheType, string> = {
		image: 'image/',
		json: 'application/json',
		text: 'text/plain',
		buffer: 'application/octet-stream',
		html: 'text/html'
	}

	private readonly fileExtensions: Record<CacheType, string> = {
		image: '.img',
		json: '.json',
		text: '.txt',
		buffer: '.bin',
		html: '.html'
	}

	constructor(options: BaseCacheOptions = {}) {
		this.maxAge = options.ttl || 24 * 60 * 60
		this.maxSize = options.maxSize || 100 * 1024 * 1024
		this.cacheDir = options.cacheDir || join(process.cwd(), '.cache')
		this.compression = options.compression ?? true

		this.allowedExtensions = new Set([
			'.img', '.json', '.txt', '.bin', '.html',  // Cache types
			'.png', '.jpg', '.jpeg', '.gif', '.webp'   // Image types
		])

		this.memCache = new NodeCache({
			stdTTL: options.ttl || 3600,
			checkperiod: options.checkPeriod || 600,
			useClones: false
		})
		

		this.stats = {
			hits: 0,
			misses: 0,
			keys: 0,
			memorySize: 0,
			fileSize: 0,
			byType: {
				image: 0,
				json: 0,
				text: 0,
				buffer: 0,
				html: 0
			}
		}

		this.initializeCache()
		this.startCleanupInterval()
	}

	// Generic set method for any type of data
	public async set<T>(
		key: string,
		data: T,
		type: CacheType,
		options: ImageOptions & { metadata?: Record<string, any> } = {}
	): Promise<string> {
		const hash = this.generateHash(JSON.stringify({ key, timestamp: Date.now() }))
		const fileName = `${key}-${hash}${this.fileExtensions[type]}`
		const filePath = join(this.cacheDir, fileName)

		try {
			let fileData: Buffer

			// Handle different data types
			const isImage = type === 'image' || 
						  (options.format && ['png', 'jpeg', 'webp'].includes(options.format));

			if (isImage) {
				if (!(data instanceof Buffer)) {
					throw new Error('Image data must be a Buffer')
				}
				fileData = await this.processImage(data, options)
			} else {
				switch (type) {
					case 'json':
						fileData = Buffer.from(JSON.stringify(data))
						break
					case 'text':
					case 'html':
						fileData = Buffer.from(data as string)
						break
					case 'buffer':
						fileData = data as Buffer
						break
					default:
						throw new Error(`Unsupported cache type: ${type}`)
				}

				// Only compress non-image data if compression is enabled
				if (this.compression) {
					fileData = await gzip(fileData)
				}
			}

			await writeFile(filePath, fileData)

			const cacheItem: CacheItem<T> = {
				data,
				type,
				createdAt: Date.now(),
				metadata: options.metadata
			}
			this.memCache.set(fileName, cacheItem)

			this.stats.byType[type]++
			await this.updateStats()

			return fileName
		} catch (error) {
			console.error(`Error saving ${type} to cache:`, error)
			throw error
		}
	}

	// Generic get method
	public async get<T>(fileName: string): Promise<{
		data: T
		exists: boolean
		contentType: string
		size: number
		metadata?: Record<string, any>
		path: string
	}> {
		// Check memory cache first
		const memCached = this.memCache.get<CacheItem<T>>(fileName)
		if (memCached) {
			this.stats.hits++
			return {
				data: memCached.data,
				exists: true,
				contentType: this.getContentType(memCached.type),
				size: 0,
				metadata: memCached.metadata,
				path: join(this.cacheDir, fileName)
			}
		}

		const filePath = join(this.cacheDir, fileName)
		if (!this.isValidFilePath(filePath)) {
			throw new Error('Invalid file path')
		}

		const exists = existsSync(filePath)
		if (!exists) {
			this.stats.misses++
			return {
				data: null as any,
				exists: false,
				contentType: 'application/octet-stream',
				size: 0,
				path: filePath
			}
		}

		try {
			let fileData = await readFile(filePath)
			const type = this.getTypeFromFileName(fileName)
			const isImage = type === 'image' || 
						  fileName.match(/\.(png|jpg|jpeg|gif|webp)$/i);

			// Only decompress if it's not an image and compression is enabled
			if (this.compression && !isImage) {
				try {
					fileData = await ungzip(fileData)
				} catch (error) {
					console.warn('Decompression failed, using raw data:', error)
					// Continue with raw data if decompression fails
				}
			}

			// Parse data based on type
			let parsedData: T
			if (isImage) {
				parsedData = fileData as any
			} else {
				switch (type) {
					case 'json':
						parsedData = JSON.parse(fileData.toString()) as T
						break
					case 'text':
					case 'html':
						parsedData = fileData.toString() as any
						break
					default:
						parsedData = fileData as any
				}
			}

			const stats = await stat(filePath)
			this.stats.hits++

			return {
				data: parsedData,
				exists: true,
				contentType: this.getContentType(type),
				size: stats.size,
				path: filePath
			}
		} catch (error) {
			console.error('Error reading from cache:', error)
			throw error
		}
	}

	// Specialized methods for different types
	public async setImage(key: string, data: Buffer, options: ImageOptions = {}) {
		return this.set(key, data, 'image', options)
	}

	public async setJSON<T>(key: string, data: T, metadata?: Record<string, any>) {
		return this.set(key, data, 'json', { metadata })
	}

	public async setText(key: string, data: string, metadata?: Record<string, any>) {
		return this.set(key, data, 'text', { metadata })
	}

	public async setHTML(key: string, data: string, metadata?: Record<string, any>) {
		return this.set(key, data, 'html', { metadata })
	}

	public async saveFile(
		key: string, 
		data: Buffer, 
		options: {
			format?: 'png' | 'jpeg' | 'webp'
			quality?: number
			width?: number
			height?: number
			metadata?: Record<string, any>
		} = {}
	): Promise<string> {
		const hash = this.generateHash(data)
		const ext = options.format ? `.${options.format}` : '.png'
		const fileName = `${key}-${hash}${ext}`
		const filePath = join(this.cacheDir, fileName)

		try {
			// Process image if needed
			let processedData = data
			if (options.format || options.quality || options.width || options.height) {
				processedData = await this.processImage(data, options)
			}

			// Save to file system
			await writeFile(filePath, processedData)

			// Save to memory cache
			this.memCache.set(fileName, {
				data: processedData,
				type: 'image',
				createdAt: Date.now(),
				metadata: options.metadata
			})

			await this.updateStats()
			return fileName

		} catch (error) {
			console.error('Error saving file to cache:', error)
			throw error
		}
	}

	private initializeCache(): void {
		try {
			if (!existsSync(this.cacheDir)) {
				mkdirSync(this.cacheDir, { recursive: true })
			}
			console.log(`Cache initialized at ${this.cacheDir}`)
		} catch (error) {
			console.error('Failed to initialize cache directory:', error)
		}
	}

	private startCleanupInterval(): void {
		// Clean up every hour
		setInterval(() => {
			this.cleanupCache()
				.then(() => this.updateStats())
				.catch(error => console.error('Cache cleanup failed:', error))
		}, 60 * 60 * 1000)
	}

	private async cleanupCache(): Promise<void> {
		try {
			const files = await this.listCacheFiles()
			const now = Date.now()
			let totalSize = 0

			for (const file of files) {
				const filePath = join(this.cacheDir, file)
				const stats = await stat(filePath)
				totalSize += stats.size

				// Remove if expired or if total size exceeds max
				if (now - stats.mtimeMs > this.maxAge * 1000 || totalSize > this.maxSize) {
					await this.removeFile(file)
				}
			}
		} catch (error) {
			console.error('Cache cleanup error:', error)
		}
	}

	private async listCacheFiles(): Promise<string[]> {
		try {
			const files = await readdir(this.cacheDir)
			return files.filter(file => 
				this.allowedExtensions.has(path.extname(file).toLowerCase())
			)
		} catch (error) {
			console.error('Error listing cache files:', error)
			return []
		}
	}

	public async removeFile(fileName: string): Promise<void> {
		const filePath = join(this.cacheDir, fileName)

		if (!this.isValidFilePath(filePath)) {
			throw new Error('Invalid file path')
		}

		try {
			if (existsSync(filePath)) {
				await unlink(filePath)
				this.memCache.del(fileName)
				await this.updateStats()
			}
		} catch (error) {
			console.error('Error removing cached file:', error)
			throw error
		}
	}

	public async getStats(): Promise<CacheStats> {
		await this.updateStats()
		return this.stats
	}

	private async updateStats(): Promise<void> {
		const files = await this.listCacheFiles()
		let fileSize = 0

		for (const file of files) {
			const stats = await stat(join(this.cacheDir, file))
			fileSize += stats.size
		}

		this.stats.keys = files.length
		this.stats.fileSize = fileSize
		this.stats.memorySize = this.memCache.getStats().vsize
	}

	private generateHash(content: string | Buffer): string {
		const data = typeof content === 'string' ? content : content
		return crypto.createHash('sha256').update(data).digest('hex').slice(0, 8)
	}

	private isValidFilePath(filePath: string): boolean {
		const normalizedPath = path.normalize(filePath)
		return (
			normalizedPath.startsWith(this.cacheDir) &&
			this.allowedExtensions.has(path.extname(normalizedPath).toLowerCase())
		)
	}

	private getContentType(type: CacheType): string {
		return this.contentTypes[type] || 'application/octet-stream'
	}

	private async processImage(buffer: Buffer, options: ImageOptions): Promise<Buffer> {
		let image = sharp(buffer)

		if (options.width || options.height) {
			image = image.resize(options.width, options.height, {
				fit: 'inside',
				withoutEnlargement: true
			})
		}

		switch (options.format) {
			case 'jpeg':
				return image.jpeg({ quality: options.quality || 80 }).toBuffer()
			case 'webp':
				return image.webp({ quality: options.quality || 80 }).toBuffer()
			default:
				return image.png({ quality: options.quality || 100 }).toBuffer()
		}
	}

	private getTypeFromFileName(fileName: string): CacheType {
		const ext = path.extname(fileName)
		const entry = Object.entries(this.fileExtensions).find(([_, value]) => value === ext)
		return (entry?.[0] as CacheType) || 'buffer'
	}
}
