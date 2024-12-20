import { Router, Request, Response } from 'express'
import { error, render } from '@/utils/request'
import { requireAuth } from '@/middleware/auth'
import linksSchema from '@/schemas/links.schema'
import NodeCache from 'node-cache'
import { getFontAwesomeIcons } from '@/utils/icons'
import BlocklistModel from '@/schemas/blocklist.schema'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { uploadImage, validateImage } from '@/utils/upload'
import config from '@/cfg'
import * as constants from '@/constants'
import multer from 'multer'
import path from 'path'
import { ensureDirs, UPLOADS_DIR } from '@/paths'
import fs from 'fs'

const router = Router()

// Configure multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadDir = path.join(process.cwd(), 'public', 'uploads')
		// Ensure upload directory exists
		ensureDirs()
		cb(null, uploadDir)
	},
	filename: function (req, file, cb) {
		// Create unique filename with original extension
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, uniqueSuffix + path.extname(file.originalname))
	},
})

// Configure multer upload
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (req, file, cb) => {
		// Allow only images
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true)
		} else {
			cb(
				new Error(
					'Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed.',
				),
			)
		}
	},
})

router.get('/', (req: Request, res: Response) => {
	res.redirect('/admin/dashboard')
})

// Login page
router.get('/login', (req: Request, res: Response) => {
	render(req, res, 'admin/login', {
		title: 'Admin Login',
	})
})

// Login POST endpoint
router.post('/login', (req: Request, res: Response) => {
	const { password } = req.body
	const adminPassword = process.env.ADMIN_PASSWORD
	const sessionToken = process.env.SESSION_TOKEN

	if (!adminPassword || !sessionToken) {
		console.error(
			'ADMIN_PASSWORD or SESSION_TOKEN not set in environment variables',
		)
		return render(req, res, 'admin/login', {
			title: 'Admin Login',
			error: 'Server configuration error',
		})
	}

	if (password === adminPassword) {
		res.cookie('adminToken', sessionToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		})
		res.redirect('/admin/dashboard')
	} else {
		render(req, res, 'admin/login', {
			title: 'Admin Login',
			error: 'Invalid password',
		})
	}
})

// Protected routes
router.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
	try {
		const [links, icons] = await Promise.all([
			linksSchema.find().sort({ priority: -1 }),
			getFontAwesomeIcons(),
		])

		render(req, res, 'admin/dashboard', {
			title: 'Admin Dashboard',
			$links: links,
			icons: icons,
			alert: req.query.alert || '',
			message: req.query.message || '',
		})
	} catch (err) {
		console.error('Error loading dashboard:', err)
		res.redirect('/?alert=error&message=Error loading dashboard')
	}
})

// Logout
router.get('/logout', (req: Request, res: Response) => {
	res.clearCookie('adminToken')
	res.redirect('/admin/login')
})

// Add new link
router.post('/links', requireAuth, async (req: Request, res: Response) => {
	try {
		const { title, url, type, priority, description, icon, active, id } =
			req.body
		const _method = req.body._method || req.query._method

		if (_method === 'DELETE') {
			if (!id) {
				return res.redirect(
					'/admin/dashboard?alert=error&message=No link ID provided',
				)
			}
			await linksSchema.findByIdAndDelete(id)
			return res.redirect(
				'/admin/dashboard?alert=success&message=Link deleted successfully',
			)
		} else if (_method === 'PUT') {
			const priorityNum = parseInt(priority)
			if (isNaN(priorityNum)) {
				return res.redirect(
					'/admin/dashboard?alert=error&message=Priority must be a number',
				)
			}
			await linksSchema.findByIdAndUpdate(id, {
				title: title.trim(),
				url: url.trim(),
				type: type.trim(),
				priority: priorityNum,
				description: description?.trim() || '',
				icon: icon.trim(),
				active: active === 'on',
			})

			return res.redirect(
				'/admin/dashboard?alert=success&message=Link updated successfully',
			)
		}

		// Validate required fields
		if (!title || !url || !type || !icon) {
			return res.redirect(
				'/admin/dashboard?alert=error&message=All required fields must be filled',
			)
		}
		// Validate priority is a number
		const priorityNum = parseInt(priority)
		if (isNaN(priorityNum)) {
			return res.redirect(
				'/admin/dashboard?alert=error&message=Priority must be a number',
			)
		}

		const newLink = new linksSchema({
			title: title.trim(),
			url: url.trim(),
			type: type.trim(),
			priority: priorityNum,
			description: description?.trim() || '',
			icon: icon.trim(),
			active: active === 'on',
		})

		await newLink.save()
		res.redirect(
			'/admin/dashboard?alert=success&message=Link created successfully',
		)
	} catch (err) {
		console.error('Error creating link:', err)
		res.redirect('/admin/dashboard?alert=error&message=Error creating link')
	}
})

// Blocklist routes
router.get('/blocklist', requireAuth, async (req: Request, res: Response) => {
	try {
		const blocklist = await BlocklistModel.find().sort({ createdAt: -1 })
		render(req, res, 'admin/blocklist', {
			title: 'Blocklist Management',
			blocklist,
			alert: req.query.alert || '',
			message: req.query.message || '',
		})
	} catch (err) {
		console.error('Error loading blocklist:', err)
		res.redirect('/admin/dashboard?alert=error&message=Error loading blocklist')
	}
})

router.post('/blocklist', requireAuth, async (req: Request, res: Response) => {
	try {
		const { type, value, reason, duration } = req.body
		const _method = req.body._method || req.query._method

		// Handle DELETE request
		if (_method === 'DELETE') {
			const { id } = req.body
			if (!id) {
				return res.redirect(
					'/admin/blocklist?alert=error&message=No block ID provided',
				)
			}
			await BlocklistModel.findByIdAndDelete(id)
			return res.redirect(
				'/admin/blocklist?alert=success&message=Block removed successfully',
			)
		}

		// Validate required fields
		if (!type || !value) {
			return res.redirect(
				'/admin/blocklist?alert=error&message=Type and value are required',
			)
		}

		// Calculate expiration date if duration is provided (in hours)
		const expiresAt =
			duration ?
				new Date(Date.now() + parseInt(duration) * 60 * 60 * 1000)
			:	undefined

		// Create new block
		const block = new BlocklistModel({
			type,
			value: value.trim(),
			reason: reason?.trim(),
			expiresAt,
		})

		await block.save()
		res.redirect(
			'/admin/blocklist?alert=success&message=Block added successfully',
		)
	} catch (err) {
		console.error('Error managing blocklist:', err)
		res.redirect(
			'/admin/blocklist?alert=error&message=Error managing blocklist',
		)
	}
})

//@ts-ignore
router.post(
	'/upload',
	requireAuth,
	upload.single('image'),
	//@ts-ignore
	(req: Request, res: Response) => {
		try {
			if (!req.file) {
				return res.status(400).json({
					success: false,
					message: 'No file uploaded',
				})
			}

			// Return the file path
			res.json({
				success: true,
				file: {
					filename: req.file.filename,
					path: `/uploads/${req.file.filename}`,
					size: req.file.size,
					mimetype: req.file.mimetype,
				},
			})
		} catch (err) {
			console.error('Error uploading file:', err)
			res.status(500).json({
				success: false,
				message: 'Error uploading file',
			})
		}
	},
)

// Add error handler for multer errors
//@ts-ignore
router.use((err: any, req: Request, res: Response, next: Function) => {
	if (err instanceof multer.MulterError) {
		// Multer error occurred
		return res.status(400).json({
			success: false,
			message: err.message,
		})
	} else if (err) {
		// Other error occurred
		return res.status(500).json({
			success: false,
			message: err.message,
		})
	}
	next()
})

// Add image routes
router.get('/images', requireAuth, async (req: Request, res: Response) => {
	try {
		// Read the uploads directory
		const files = fs.readdirSync(UPLOADS_DIR)
		const images = files
			.map((filename) => {
				const stats = fs.statSync(path.join(UPLOADS_DIR, filename))
				return {
					filename,
					originalname: filename,
					size: stats.size,
					created: stats.birthtime,
				}
			})
			.sort((a, b) => b.created.getTime() - a.created.getTime())

		render(req, res, 'admin/images', { images })
	} catch (err) {
		console.error('Error reading images:', err)
		error(req, res, 'Error reading images')
	}
})

router.post(
	'/images/upload',
	requireAuth,
	upload.single('image'),
	async (req: Request, res: Response) => {
		if (!req.file) {
			return error(req, res, 'No image uploaded')
		}

		res.redirect(
			'/admin/images?alert=success&message=Image uploaded successfully',
		)
	},
)

router.post(
	'/images/delete',
	requireAuth,
	async (req: Request, res: Response) => {
		const { filename } = req.body
		if (!filename) {
			return error(req, res, 'No filename provided')
		}

		try {
			const filepath = path.join(UPLOADS_DIR, filename)
			if (fs.existsSync(filepath)) {
				fs.unlinkSync(filepath)
				res.redirect(
					'/admin/images?alert=success&message=Image deleted successfully',
				)
			} else {
				error(req, res, 'Image not found')
			}
		} catch (err) {
			console.error('Error deleting image:', err)
			error(req, res, 'Error deleting image')
		}
	},
)

export default router
