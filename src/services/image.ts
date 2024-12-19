import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { join } from 'path'
import { writeFile } from 'fs/promises'
import { mkdirSync, existsSync } from 'fs'
import os from 'os'
import { CacheService } from './cache'

const tmpDir = os.tmpdir()
const cacheService = new CacheService()

interface LanguageColors {
	[key: string]: string
}

const LANGUAGE_COLORS: LanguageColors = {
	TypeScript: '#3178C6',
	JavaScript: '#F7DF1E',
	Python: '#3776AB',
	Java: '#007396',
	'C++': '#00599C',
	Ruby: '#CC342D',
	Go: '#00ADD8',
	Rust: '#DEA584',
	PHP: '#777BB4',
	Swift: '#FA7343',
	Kotlin: '#7F52FF',
	HTML: '#E34F26',
	CSS: '#1572B6',
	Shell: '#89E051',
	Vue: '#4FC08D',
	React: '#61DAFB',
	// Add more languages as needed
	Other: '#8B8B8B',
}

export async function generateRepoImage(
	repoName: string,
	description: string,
	languages: { [key: string]: number },
	stars: number,
	forks: number,
) {
	const width = 1200
	const height = 600
	const canvas = createCanvas(width, height)
	const ctx = canvas.getContext('2d')

	// Modern gradient background
	const gradient = ctx.createLinearGradient(0, 0, width, height)
	gradient.addColorStop(0, '#0d1117')
	gradient.addColorStop(1, '#161b22')
	ctx.fillStyle = gradient
	ctx.fillRect(0, 0, width, height)

	// Add a subtle grid pattern
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
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

	// Add a modern card-like container
	const cardX = 40
	const cardY = 40
	const cardWidth = width - 80
	const cardHeight = height - 80
	const cardRadius = 16

	// Card glow effect
	ctx.shadowColor = 'rgba(255, 255, 255, 0.1)'
	ctx.shadowBlur = 30
	ctx.fillStyle = 'rgba(22, 27, 34, 0.8)'
	ctx.beginPath()
	ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius)
	ctx.fill()
	ctx.shadowBlur = 0

	// Repository name with modern font
	ctx.font = '600 56px "Inter"'
	ctx.fillStyle = '#ffffff'
	ctx.fillText(repoName, 80, 120)

	// Description with better wrapping
	ctx.font = '400 28px "Inter"'
	ctx.fillStyle = '#8b949e'
	const words = description.split(' ')
	let line = ''
	let y = 180
	const maxWidth = width - 160

	for (const word of words) {
		const testLine = line + word + ' '
		const metrics = ctx.measureText(testLine)
		if (metrics.width > maxWidth && line !== '') {
			ctx.fillText(line.trim(), 80, y)
			line = word + ' '
			y += 40
			if (y > 300) break // Limit description to 3 lines
		} else {
			line = testLine
		}
	}
	if (y <= 300) ctx.fillText(line.trim(), 80, y)

	// Modern stats display
	const statsY = height - 180
	ctx.font = '500 24px "Inter"'

	// Stars with golden color
	const starIcon = await loadImage(
		join(process.cwd(), 'src/public/images/icons/star.png'),
	)
	ctx.drawImage(starIcon, 80, statsY - 24, 24, 24)
	ctx.fillStyle = '#F1E05A' // GitHub's star color
	ctx.fillText(`${stars.toLocaleString()}`, 114, statsY)

	// Forks with blue color
	const forkIcon = await loadImage(
		join(process.cwd(), 'src/public/images/icons/git-fork.png'),
	)
	ctx.drawImage(forkIcon, 200, statsY - 24, 24, 24)
	ctx.fillStyle = '#58A6FF' // GitHub's fork color
	ctx.fillText(`${forks.toLocaleString()}`, 234, statsY)

	// Language bars with modern design
	const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0)
	const barWidth = width - 160
	let currentX = 80
	const barHeight = 6
	const barY = height - 100

	// Sort and limit to top 5 languages
	const sortedLanguages = Object.entries(languages)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5)

	// Draw language bars with rounded corners
	for (const [lang, bytes] of sortedLanguages) {
		const percentage = bytes / totalBytes
		const segmentWidth = barWidth * percentage

		ctx.fillStyle = LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other
		ctx.beginPath()
		ctx.roundRect(currentX, barY, segmentWidth, barHeight, 3)
		ctx.fill()

		currentX += segmentWidth
	}

	// Language labels with modern styling
	currentX = 80
	const legendY = height - 60
	ctx.font = '400 18px "Inter"'

	for (const [lang, bytes] of sortedLanguages) {
		const percentage = Math.round((bytes / totalBytes) * 100)
		const label = `${lang} ${percentage}%`

		// Modern dot indicator
		ctx.fillStyle = LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other
		ctx.beginPath()
		ctx.arc(currentX, legendY - 8, 4, 0, Math.PI * 2)
		ctx.fill()

		// Label with better spacing
		ctx.fillStyle = '#8b949e'
		ctx.fillText(label, currentX + 12, legendY)

		currentX += ctx.measureText(label).width + 32
	}

	// Save the image using cache service
	const buffer = canvas.toBuffer('image/png')
	const fileName = await cacheService.saveFile(`github-${repoName}`, buffer, {
		format: 'png',
		quality: 100,
		width,
		height,
	})

	return `/.cache/${fileName}`
}
