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
import updaterRouter from '@/routes/updater'
import { CronService } from '@/services/cron'
import { ensureDirs } from '@/paths'

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

// Routes
app.use('/', mainRouter)
app.use('/.cache', cacheRouter)
app.use('/admin', adminRouter)
app.use('/og-image', ogImageRouter)
app.use('/blog', blogRouter)
app.use('/updater', updaterRouter)

app.use((req: Request, res: Response) => {
	if (req.path.includes('.php')) {
		res.status(403).send('Forbidden')
	} else {
		error(req, res, new Error('Page not found'), 404)
	}
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	if (req.path.includes('.php')) {
		res.status(403).send('Forbidden')
	} else {
		error(req, res, err, 500)
	}
})

// Serve media files
app.use(
	'/media',
	express.static(process.env.BLOG_MEDIA || path.join(process.cwd(), 'media')),
)

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

			cronService.registerJob({
				name: 'clear-cache',
				schedule: '0 0 * * *',
				task: () => {
					fs.rmSync('.cache', { recursive: true, force: true })
				},
			})
		} catch (error) {
			console.error('Startup error:', error)
			process.exit(1)
		}
	},
)

export { app, server }
