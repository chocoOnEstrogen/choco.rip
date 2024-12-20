import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import { exec } from 'child_process'
import { promisify } from 'util'
import pm2 from 'pm2'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { readFileSync } from 'fs'

const buildSteps = require('../../.github/build-steps.json')

if (!buildSteps) {
	throw new Error('Build steps not found')
}

const router = Router()
const execAsync = promisify(exec)
const connectPM2 = promisify(pm2.connect.bind(pm2))
const listPM2 = promisify(pm2.list.bind(pm2))
const restartPM2 = promisify(pm2.restart.bind(pm2))

// Rate limiting configuration
const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 10,
	message: { error: 'Too many update attempts, please try again later' },
	standardHeaders: true,
	legacyHeaders: false,
})

// Webhook payload schema with strict validation
const webhookSchema = z.object({
	ref: z.string().min(1),
	repository: z.object({
		full_name: z.string().min(1),
		default_branch: z.string().min(1),
	}),
	head_commit: z.object({
		id: z.string().min(1),
		message: z.string(),
		timestamp: z.string(),
		author: z.object({
			name: z.string().min(1),
			email: z.string().email(),
		}),
	}),
})

type WebhookPayload = z.infer<typeof webhookSchema>

// Verify GitHub webhook signature using secure comparison
const verifySignature = (payload: string, signature: string): boolean => {
	const secret = process.env.GITHUB_WEBHOOK_SECRET
	if (!secret) {
		throw new Error(
			'GITHUB_WEBHOOK_SECRET environment variable is not configured',
		)
	}

	const hmac = crypto.createHmac('sha256', secret)
	const digest = `sha256=${hmac.update(payload).digest('hex')}`
	return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

// Get PM2 app info with better error handling
const getPM2AppInfo = async () => {
	try {
		const configPath = path.join(process.cwd(), 'ecosystem.config.js')
		const ecosystem = require(configPath)

		if (!ecosystem?.apps?.[0]) {
			throw new Error('Invalid ecosystem config format')
		}

		return ecosystem.apps[0]
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error reading ecosystem config:', error.message)
		}
		return null
	}
}

// Check PM2 process status with proper cleanup
const isAppRunningInPM2 = async (appName: string): Promise<boolean> => {
	try {
		await connectPM2()
		const list = await listPM2()
		return list.some(
			(app) => app.name === appName && app.pm2_env?.status === 'online',
		)
	} finally {
		await promisify(pm2.disconnect.bind(pm2))()
	}
}

// Enhanced update process with better logging and error handling
const performUpdate = async (payload: WebhookPayload) => {
	const updateLog: string[] = []
	const logUpdate = (message: string, level: 'info' | 'error' = 'info') => {
		const timestamp = new Date().toISOString()
		const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`
		console[level](logMessage)
		updateLog.push(logMessage)
	}

	try {
		// Validate current directory is a git repository
		await execAsync('git rev-parse --git-dir')
		let stepCount = 0

		for (const step of buildSteps) {
			logUpdate(
				`Running step: ${step.name} (${stepCount + 1}/${buildSteps.length})`,
			)
			const { stdout: stepOutput } = await execAsync(step.command)
			logUpdate(`${step.name} output: ${stepOutput.trim()}`)
			stepCount++
		}

		// Get and verify PM2 app info
		const appInfo = await getPM2AppInfo()
		if (!appInfo?.name) {
			throw new Error('Invalid PM2 configuration: missing app name')
		}

		// Verify PM2 process exists and is running
		const isRunning = await isAppRunningInPM2(appInfo.name)
		if (!isRunning) {
			throw new Error(`PM2 process ${appInfo.name} is not running`)
		}

		return { success: true, log: updateLog, appName: appInfo.name }
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error occurred'
		logUpdate(`Error during update: ${errorMessage}`, 'error')
		throw error
	}
}

//@ts-ignore
router.post('/webhook', limiter, async (req: Request, res: Response) => {
	try {
		// Verify GitHub signature
		const signature = req.headers['x-hub-signature-256']
		if (!signature || typeof signature !== 'string') {
			return res.status(401).json({ error: 'Missing GitHub signature' })
		}

		const rawBody = JSON.stringify(req.body)
		if (!verifySignature(rawBody, signature)) {
			return res.status(401).json({ error: 'Invalid GitHub signature' })
		}

		// Verify GitHub event type
		const event = req.headers['x-github-event']
		if (event !== 'push' && event !== 'ping') {
			return res.status(400).json({
				error: 'Invalid event type',
				message: `Expected 'push' or 'ping' event, got '${event}'`,
			})
		}

		if (event === 'ping') {
			return res.status(200).json({ message: 'Pong' })
		}

		// Validate webhook payload
		const payload = webhookSchema.parse(req.body)

		// Check branch
		if (!payload.ref.endsWith(payload.repository.default_branch)) {
			return res.status(200).json({
				message: `Ignoring push to non-default branch: ${payload.ref}`,
				branch: payload.ref,
			})
		}

		// Perform update
		const result = await performUpdate(payload)

		// Send response before restarting
		res.status(200).json({
			message: 'Update process completed successfully',
			commit: payload.head_commit.id,
			timestamp: new Date().toISOString(),
			log: result.log,
		})

		// Wait a moment to ensure response is sent
		await new Promise((resolve) => setTimeout(resolve, 1000))

		// Restart PM2 process after response is sent
		await connectPM2()
		await restartPM2(result.appName)
		console.log(
			`[${new Date().toISOString()}] PM2 process ${result.appName} restarted successfully`,
		)
	} catch (error) {
		console.error('Update process failed:', error)
		res.status(500).json({
			error: 'Update process failed',
			message:
				error instanceof Error ? error.message : 'Unknown error occurred',
			timestamp: new Date().toISOString(),
		})
	}
})

export default router
