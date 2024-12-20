import { Router, Request, Response, NextFunction } from 'express'
import { CacheService } from '@/services/cache'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { createReadStream } from 'fs'

const router = Router()
const cache = new CacheService()

// Rate limiting middleware
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
})

// Apply rate limiting to all cache routes
router.use('/', limiter)

// Updated security middleware
const securityMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const fileName = req.params[0] || ''
	const ext = path.extname(fileName).toLowerCase()

	// Check file extension
	if (!cache['allowedExtensions'].has(ext)) {
		console.log('cacheExt', cache['allowedExtensions'])
		console.log('ext', ext)
		return res.status(403).json({
			error: 'Invalid file type',
			allowedTypes: Array.from(cache['allowedExtensions']),
		})
	}

	// Prevent directory traversal
	if (fileName.includes('..') || fileName.includes('~')) {
		return res.status(403).json({ error: 'Invalid path' })
	}

	// Updated file name pattern to support both formats:
	// - key-hash.ext
	// - key-hash1-hash2.ext
	const fileNamePattern = /^[\w-]+-[a-f0-9]{8,32}(-[a-f0-9]{8})?\.[a-z]+$/
	if (!fileNamePattern.test(fileName)) {
		return res.status(403).json({ error: 'Invalid file name format' })
	}

	next()
}

// Get cache stats
router.get('/stats', async (_req: Request, res: Response) => {
	try {
		const stats = await cache.getStats()
		res.json(stats)
	} catch (error) {
		console.error('Error getting cache stats:', error)
		res.status(500).json({ error: 'Failed to get cache statistics' })
	}
})

// Get cached file
//@ts-ignore
router.get('/*', securityMiddleware, async (req: Request, res: Response) => {
	try {
		const fileName = req.params[0]
		if (!fileName) {
			return res.status(400).json({ error: 'File name is required' })
		}

		const file = await cache.get(fileName)

		if (!file.exists) {
			return res.status(404).json({ error: 'File not found' })
		}

		// Set common security headers
		res.set({
			'Cache-Control': 'public, max-age=86400',
			'Content-Type': file.contentType,
			'Content-Length': file.size,
			'X-Content-Type-Options': 'nosniff',
			'X-Frame-Options': 'DENY',
			'X-XSS-Protection': '1; mode=block',
		})

		// Handle different response types
		if (file.contentType.startsWith('image/')) {
			const stream = createReadStream(file.path)
			stream.pipe(res)
			stream.on('error', (error) => {
				console.error('Error streaming file:', error)
				if (!res.headersSent) {
					res.status(500).json({ error: 'Error streaming file' })
				}
			})
		} else if (file.contentType === 'application/json') {
			res.json(file.data)
		} else if (
			file.contentType === 'text/plain' ||
			file.contentType === 'text/html'
		) {
			res.send(file.data)
		} else {
			res.send(file.data)
		}
	} catch (error) {
		console.error('Error serving cached file:', error)
		if (error instanceof Error) {
			if (error.message.includes('Invalid file path')) {
				return res.status(403).json({ error: 'Invalid file path' })
			}
			if (error.message.includes('ENOENT')) {
				return res.status(404).json({ error: 'File not found' })
			}
		}
		res.status(500).json({ error: 'Internal server error' })
	}
})

export default router
