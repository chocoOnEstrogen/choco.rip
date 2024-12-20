import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { join } from 'path'
import { CacheService } from './cache'
import { formatDistance } from 'date-fns'
import sharp from 'sharp'
import { UAParser } from 'ua-parser-js'
import crypto from 'crypto'
import axios from 'axios'

const cacheService = new CacheService({
	cacheDir: join(__dirname, '../../.cache'),
	compression: true,
	ttl: 24 * 60 * 60, // 24 hours
})

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

function calculateFontSize(text: string, maxWidth: number, ctx: any): number {
	let fontSize = 72 // Start with large font
	ctx.font = `bold ${fontSize}px sans-serif`
	let metrics = ctx.measureText(text)

	// Reduce font size until text fits
	while (metrics.width > maxWidth && fontSize > 24) {
		fontSize -= 2
		ctx.font = `bold ${fontSize}px sans-serif`
		metrics = ctx.measureText(text)
	}

	return fontSize
}

function calculateTextHeight(
	text: string,
	maxWidth: number,
	fontSize: number,
	ctx: any,
): number {
	const words = text.split(' ')
	let lines = 1
	let currentLine = ''

	ctx.font = `${fontSize}px sans-serif`

	for (const word of words) {
		const testLine = currentLine + word + ' '
		const metrics = ctx.measureText(testLine)

		if (metrics.width > maxWidth) {
			currentLine = word + ' '
			lines++
		} else {
			currentLine = testLine
		}
	}

	return lines * (fontSize * 1.2) // 1.2 is line height
}

export async function generateOGImage(options: OGImageOptions) {
	const cacheKey = `og-${crypto
		.createHash('md5')
		.update(JSON.stringify(options))
		.digest('hex')}`
	try {
		const cached = await cacheService.get(cacheKey)
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

	// Calculate layout dimensions
	const padding = {
		x: 80,
		y: 60,
	}

	// Calculate content area based on image presence
	const hasImage = !!options.imageUrl
	const contentArea = {
		width: hasImage ? width - 500 : width - padding.x * 2,
		x: padding.x,
	}

	// Title
	const titleFontSize = calculateFontSize(options.title, contentArea.width, ctx)
	ctx.font = `bold ${titleFontSize}px sans-serif`
	ctx.fillStyle = isDark ? '#ffffff' : '#000000'

	const titleY = padding.y + titleFontSize
	wrapText(
		ctx,
		options.title,
		contentArea.x,
		titleY,
		contentArea.width,
		titleFontSize * 1.2,
	)

	// Description
	let descriptionBottom = titleY
	if (options.description) {
		const descriptionY = titleY + 60
		const descriptionFontSize = Math.min(28, titleFontSize * 0.5)
		ctx.font = `${descriptionFontSize}px sans-serif`
		ctx.fillStyle = isDark ? '#8b949e' : '#64748b'

		const descriptionHeight = wrapText(
			ctx,
			options.description,
			contentArea.x,
			descriptionY,
			contentArea.width,
			descriptionFontSize * 1.4,
			3,
		)
		descriptionBottom = descriptionY + descriptionHeight
	}

	// Handle external image
	if (options.imageUrl) {
		try {
			const response = await axios.get(options.imageUrl, {
				responseType: 'arraybuffer',
				timeout: 5000,
			})

			const image = await loadImage(Buffer.from(response.data))

			// Calculate image dimensions to make a perfect circle
			const diameter = Math.min(400, height - padding.y * 2)
			const imgSize = diameter

			// Position image on the right
			const imgX = width - imgSize - padding.x
			const imgY = (height - imgSize) / 2 // Center vertically

			// Draw circular image
			ctx.save()
			ctx.beginPath()
			ctx.arc(
				imgX + imgSize / 2,
				imgY + imgSize / 2,
				imgSize / 2,
				0,
				Math.PI * 2,
			)
			ctx.clip()
			ctx.drawImage(image, imgX, imgY, imgSize, imgSize)
			ctx.restore()
		} catch (error) {
			console.warn('Failed to load image:', error)
		}
	}

	// Tags
	if (options.tags && options.tags.length > 0) {
		const tagStartY = height - 140 // Fixed position from bottom
		let tagX = contentArea.x

		ctx.font = 'bold 20px sans-serif'
		options.tags.slice(0, 4).forEach((tag) => {
			const tagWidth = ctx.measureText(tag).width + 24
			const tagHeight = 36

			// Tag background
			ctx.fillStyle =
				isDark ? 'rgba(56, 139, 253, 0.15)' : 'rgba(56, 139, 253, 0.1)'
			ctx.beginPath()
			ctx.roundRect(tagX, tagStartY, tagWidth, tagHeight, 18)
			ctx.fill()

			// Tag text
			ctx.fillStyle = isDark ? '#58a6ff' : '#0969da'
			ctx.fillText(tag, tagX + 12, tagStartY + 24)

			tagX += tagWidth + 12
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

		ctx.fillText(bottomText, contentArea.x, height - padding.y)
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

// Updated wrapText function with better line handling
function wrapText(
	ctx: any,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number,
	maxLines: number = 2,
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
					// Add ellipsis if there's more text
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

	return currentY - y
}
