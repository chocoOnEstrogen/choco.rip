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
