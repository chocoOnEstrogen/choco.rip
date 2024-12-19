import { UploadedFile } from 'express-fileupload'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

interface ImageOptions {
	width?: number
	height?: number
	quality?: number
	format?: 'jpeg' | 'png' | 'webp'
}

// Ensure media directory exists
const mediaDir = process.env.BLOG_MEDIA || path.join(process.cwd(), 'media')

// Create media directory if it doesn't exist
async function ensureMediaDir() {
	try {
		await fs.access(mediaDir)
	} catch {
		await fs.mkdir(mediaDir, { recursive: true })
	}
}

export async function uploadImage(
	file: UploadedFile,
	options: ImageOptions = {},
): Promise<string> {
	try {
		await ensureMediaDir()

		const { width, height, quality = 80, format = 'webp' } = options

		// Create year/month subdirectories
		const date = new Date()
		const year = date.getFullYear()
		const month = (date.getMonth() + 1).toString().padStart(2, '0')
		const uploadDir = path.join(mediaDir, year.toString(), month)
		await fs.mkdir(uploadDir, { recursive: true })

		// Generate unique filename
		const filename = `${uuidv4()}.${format}`
		const filePath = path.join(uploadDir, filename)

		// Process image with sharp
		let imageProcessor = sharp(file.data)

		// Resize if dimensions provided
		if (width || height) {
			imageProcessor = imageProcessor.resize(width, height, {
				fit: 'cover',
				position: 'center',
			})
		}

		// Convert and optimize
		switch (format) {
			case 'webp':
				imageProcessor = imageProcessor.webp({ quality })
				break
			case 'jpeg':
				imageProcessor = imageProcessor.jpeg({ quality })
				break
			case 'png':
				imageProcessor = imageProcessor.png({ quality })
				break
		}

		// Process and save the image
		await imageProcessor.toFile(filePath)

		// Return the public URL
		return `/media/${year}/${month}/${filename}`
	} catch (error) {
		console.error('Error uploading image:', error)
		throw new Error('Failed to upload image')
	}
}

export function validateImage(file: UploadedFile): boolean {
	// Check file size (max 5MB)
	if (file.size > 5 * 1024 * 1024) {
		return false
	}

	// Check file type
	const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
	if (!allowedTypes.includes(file.mimetype)) {
		return false
	}

	return true
}
