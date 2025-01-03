import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import dotenv from 'dotenv'
import cors from 'cors'
import http from 'http'
import { render, error } from '@/utils/request'
import expressLayouts from 'express-ejs-layouts'
import mainRouter from '@/routes/main'
import cacheRouter from '@/routes/cache'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import adminRouter from '@/routes/admin'
import * as fs from 'fs'
import { checkBlocklist } from '@/middleware/blockList'
import ogImageRouter from '@/routes/og-image'
import blogRouter from '@/routes/blog'
import shortenerRouter from '@/routes/shortener'
import updaterRouter from '@/routes/updater'
import { CronService } from '@/services/cron'
import { ensureDirs, PAGES_DIR } from '@/paths'
import { parsePageFile } from './utils/pages'
import { parseMarkdownFile } from './utils/pages'
import config from '@/cfg'
// Express rate limit
import rateLimit from 'express-rate-limit'
import ShortURL from '@/schemas/shorturl.schema'

dotenv.config()

ensureDirs()

const app = express()

// Add CORS middleware before other middleware
app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	}),
)

// Clear .cache folder
const cronService = CronService.getInstance()

// Setup view engine and layouts
app.use(expressLayouts)
app.set('layout', 'layouts/main')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.static(path.join(__dirname, '../public')))
app.use(cookieParser())
app.use(checkBlocklist)
app.set('trust proxy', true)

if (config.rate_limit && config.rate_limit.enabled) {
	// Rate limit middleware
	const limiter = rateLimit({
		windowMs: config.rate_limit.window_ms || 15 * 60 * 1000, // 15 minutes
		max: config.rate_limit.max || 100, // Limit each IP to 100 requests per windowMs
		handler: (req, res) => {
			// Render the error page with rate limit message
			error(req, res, {
				status: 429,
				message: config.rate_limit?.message || 'Too many requests from this IP, please try again later.'
			}, 429);
		}
	});

	app.use(limiter);
}

const routes = [
	{
		route: '/',
		handler: mainRouter,
	},
	{
		route: '/.cache',
		handler: cacheRouter,
	},
	{
		route: '/admin',
		handler: adminRouter,
	},
	{
		route: '/og-image',
		handler: ogImageRouter,
	},
	{
		route: '/blog',
		handler: blogRouter,
	},
	{
		route: '/updater',
		handler: updaterRouter,
	},
	{
		route: '/s',
		handler: shortenerRouter,
	},
]

// Routes
for (const { route, handler } of routes) {
	app.use(route, handler)
}

if (config.media_paths) {
	for (const [key, value] of Object.entries(config.media_paths)) {
		app.use(`/media/${key}`, express.static(value))
	}
}

//@ts-ignore
app.get('/*', async (req: Request, res: Response, next: NextFunction) => {
	try {
		let requestPath = req.path.endsWith('/') ? req.path + 'index' : req.path
		requestPath = requestPath.replace(/^\//, '')

		const possiblePaths = [
			path.join(PAGES_DIR, requestPath + '.page'),
			path.join(PAGES_DIR, requestPath + '.md'),
			path.join(PAGES_DIR, requestPath, 'index.page'),
			path.join(PAGES_DIR, requestPath, 'index.md')
		]

		let filePath: string | null = null
		for (const p of possiblePaths) {
			if (fs.existsSync(p)) {
				filePath = p
				break
			}
		}

		if (!filePath) {
			return next()
		}

		const content = fs.readFileSync(filePath, 'utf-8')
		let config: any = {}
		let cleanContent: string = ''

		if (filePath.endsWith('.page')) {
			const parsed = await parsePageFile(content)
			config = parsed.config
			cleanContent = parsed.html
		} else if (filePath.endsWith('.md')) {
			const parsed = await parseMarkdownFile(content)
			config = parsed.frontmatter
			cleanContent = parsed.body
		} else {
			throw new Error('Unsupported file type')
		}

		render(req, res, 'dynamic-page', {
			title: config.title || config.seo?.title || path.basename(requestPath),
			description: config.description || config.seo?.description,
			content: cleanContent,
			css: config.css || [],
			js: config.js || [],
			isMarkdown: filePath.endsWith('.md'),
			...config,
		})
	} catch (error) {
		console.error('Error loading dynamic page:', error)
		return res.status(404).send('Page not found')
	}
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	if (req.path.includes('.php')) {
		res.status(403).send('Forbidden')
	} else {
		error(req, res, err, 500)
	}
})

// Create HTTP server instance
const server = http.createServer(app)

server.listen(
	parseInt(process.env.PORT || '9000'),
	process.env.HOST || '0.0.0.0',
	async () => {
		try {
			if (!process.env.MONGO_URI) {
				console.error('MONGO_URI is not set')
				process.exit(1)
			}

			await mongoose.connect(process.env.MONGO_URI)

			console.clear()
			console.log(
				`Server is running on port ${process.env.PORT} ${process.env.HOST}`,
			)
			console.log('MongoDB connected')

			// Register cron jobs
			cronService.registerJob([
				{
					name: 'clear-cache',
					schedule: '0 0 * * *',
					task: () => {
						fs.rmSync('.cache', { recursive: true, force: true })
					},
				}
			])

			// Start all cron jobs
			cronService.start()
		} catch (error) {
			console.error('Startup error:', error)
			process.exit(1)
		}
	},
)

export { app, server }
