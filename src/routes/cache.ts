import { Router, Request, Response, NextFunction } from 'express'
import { CacheService } from '@/services/cache'
import rateLimit from 'express-rate-limit'
import path from 'path'

const router = Router()
const cache = new CacheService()

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later',
})

// Apply rate limiting to all cache routes
router.use(limiter)

// Security middleware
//@ts-ignore
router.use((req: Request, res: Response, next: NextFunction) => {
	// Only allow specific file types
	const ext = path.extname(req.path).toLowerCase()
	if (!['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
		return res.status(403).json({ error: 'Invalid file type' })
	}

	// Prevent directory traversal
	if (req.path.includes('..')) {
		return res.status(403).json({ error: 'Invalid path' })
	}

	next()
})

// Get cached file
//@ts-ignore
router.get('/*', async (req: Request, res: Response) => {
	try {
		const fileName = req.params[0]
		if (!fileName) {
			return res.status(400).json({ error: 'File name is required' })
		}

		const file = await cache.getFile(fileName)

		if (!file.exists) {
			return res.status(404).json({ error: 'File not found' })
		}

		// Set cache control headers
		res.set({
			'Cache-Control': 'public, max-age=86400', // 24 hours
			'Content-Type': file.contentType,
			'Content-Length': file.size,
			'X-Content-Type-Options': 'nosniff',
		})

		res.sendFile(file.path)
	} catch (error) {
		console.error('Error serving cached file:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

export default router
