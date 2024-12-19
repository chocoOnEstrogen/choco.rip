import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { join } from 'path'
import { CacheService } from './cache'
import { formatDistance } from 'date-fns'
import sharp from 'sharp'
import { UAParser } from 'ua-parser-js'
import crypto from 'crypto'
import axios from 'axios'

const cacheService = new CacheService()

interface OGImageOptions {
	title: string
	description?: string
	theme?: 'light' | 'dark'
	template?: 'default' | 'minimal'
	author?: string
	date?: string
	tags?: string[]
	imageUrl?: string
}

export async function generateOGImage(options: OGImageOptions) {
	const cacheKey = `og-${crypto
		.createHash('md5')
		.update(JSON.stringify(options))
		.digest('hex')}`
	try {
		const cached = await cacheService.getFile(cacheKey)
		if (cached && cached.exists) return `/.cache/${cached.path}`
	} catch (error) {
		console.warn('Cache miss or error:', error)
	}

	const width = 1200
	const height = 630
	const canvas = createCanvas(width, height)
	const ctx = canvas.getContext('2d')

	// Modern gradient background
	const isDark = options.theme === 'dark'
	const gradient = ctx.createLinearGradient(0, 0, width, height)
	if (isDark) {
		gradient.addColorStop(0, '#0d1117')
		gradient.addColorStop(1, '#161b22')
	} else {
		gradient.addColorStop(0, '#ffffff')
		gradient.addColorStop(1, '#f8fafc')
	}
	ctx.fillStyle = gradient
	ctx.fillRect(0, 0, width, height)

	// Add subtle grid pattern
	ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'
	ctx.lineWidth = 1
	for (let i = 0; i < width; i += 30) {
		ctx.beginPath()
		ctx.moveTo(i, 0)
		ctx.lineTo(i, height)
		ctx.stroke()
	}
	for (let i = 0; i < height; i += 30) {
		ctx.beginPath()
		ctx.moveTo(0, i)
		ctx.lineTo(width, i)
		ctx.stroke()
	}

	// Card background
	const cardX = 40
	const cardY = 40
	const cardWidth = width - 80
	const cardHeight = height - 80
	const cardRadius = 24

	ctx.save()
	ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'
	ctx.shadowBlur = 30
	ctx.fillStyle = isDark ? 'rgba(22, 27, 34, 0.8)' : 'rgba(255, 255, 255, 0.8)'
	ctx.beginPath()
	ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius)
	ctx.fill()
	ctx.restore()

	// Handle external image
	let contentStartY = 120
	let titleMaxWidth = width - 160 // default width

	if (options.imageUrl) {
		try {
			// Fetch the image
			const response = await axios.get(options.imageUrl, {
				responseType: 'arraybuffer',
				timeout: 5000, // 5 second timeout
			})

			const image = await loadImage(Buffer.from(response.data))

			// Calculate image dimensions while maintaining aspect ratio
			const maxImgWidth = 400 // Maximum width for the image
			const maxImgHeight = 400 // Maximum height for the image
			let imgWidth = image.width
			let imgHeight = image.height

			// Scale image to fit within bounds
			if (imgWidth > maxImgWidth || imgHeight > maxImgHeight) {
				const ratio = Math.min(maxImgWidth / imgWidth, maxImgHeight / imgHeight)
				imgWidth *= ratio
				imgHeight *= ratio
			}

			// Position image on the right side
			const imgX = width - imgWidth - 80
			const imgY = 80

			// Draw image with rounded corners
			ctx.save()
			ctx.beginPath()
			ctx.roundRect(imgX, imgY, imgWidth, imgHeight, 12)
			ctx.clip()
			ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight)
			ctx.restore()

			// Adjust title width to account for image
			titleMaxWidth = imgX - 100
		} catch (error) {
			console.warn('Failed to load image:', error)
			// Continue without the image if it fails to load
		}
	}

	// Title
	ctx.font = 'bold 56px sans-serif'
	ctx.fillStyle = isDark ? '#ffffff' : '#000000'
	wrapText(ctx, options.title, 80, contentStartY, titleMaxWidth, 72)

	// Description
	if (options.description) {
		ctx.font = '28px sans-serif'
		ctx.fillStyle = isDark ? '#8b949e' : '#64748b'
		wrapText(
			ctx,
			options.description,
			80,
			contentStartY + 100,
			titleMaxWidth,
			40,
		)
	}

	// Tags
	if (options.tags && options.tags.length > 0) {
		let tagX = 80
		const tagY = contentStartY + 180

		ctx.font = '20px sans-serif'
		options.tags.slice(0, 4).forEach((tag) => {
			const tagWidth = ctx.measureText(tag).width + 20
			const tagHeight = 32

			// Tag background
			ctx.fillStyle =
				isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
			ctx.beginPath()
			ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 16)
			ctx.fill()

			// Tag text
			ctx.fillStyle = isDark ? '#8b949e' : '#64748b'
			ctx.fillText(tag, tagX + 10, tagY + 22)

			tagX += tagWidth + 10
		})
	}

	// Author and date
	if (options.author || options.date) {
		ctx.font = '20px sans-serif'
		ctx.fillStyle = isDark ? '#8b949e' : '#64748b'

		const bottomText = [
			options.author && `By ${options.author}`,
			options.date &&
				new Date(options.date).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				}),
		]
			.filter(Boolean)
			.join(' • ')

		ctx.fillText(bottomText, 80, height - 80)
	}

	// Optimize and cache the image
	const buffer = canvas.toBuffer('image/png')
	const optimized = await sharp(buffer)
		.png({ quality: 90, compressionLevel: 9 })
		.toBuffer()

	const fileName = await cacheService.saveFile(cacheKey, optimized, {
		format: 'png',
		quality: 90,
		width,
		height,
	})

	return `/.cache/${fileName}`
}

// Helper function to wrap text
function wrapText(
	ctx: any,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number,
	maxLines: number = 3,
) {
	const words = text.split(' ')
	let line = ''
	let currentY = y
	let lineCount = 0

	for (const word of words) {
		const testLine = line + word + ' '
		const metrics = ctx.measureText(testLine)

		if (metrics.width > maxWidth && line !== '') {
			ctx.fillText(line.trim(), x, currentY)
			line = word + ' '
			currentY += lineHeight
			lineCount++

			if (lineCount >= maxLines) {
				if (words.indexOf(word) < words.length - 1) {
					line = line.trim() + '...'
				}
				break
			}
		} else {
			line = testLine
		}
	}

	if (lineCount < maxLines) {
		ctx.fillText(line.trim(), x, currentY)
	}
}
