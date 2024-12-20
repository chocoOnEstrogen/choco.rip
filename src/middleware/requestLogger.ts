import { Request, Response, NextFunction } from 'express'
import geoip from 'geoip-lite'
import { createLogger, format, transports } from 'winston'
import { UAParser } from 'ua-parser-js'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { subHours } from 'date-fns'
import { createInterface } from 'readline'
import { createReadStream, writeFileSync } from 'fs'

// Create a rotating write stream
const logStream = createWriteStream(join(process.cwd(), 'logs/requests.log'), {
	flags: 'a',
})

// Create Winston logger instance
const logger = createLogger({
	format: format.combine(format.timestamp(), format.json()),
	transports: [
		new transports.Stream({ stream: logStream }),
		new transports.Console({
			format: format.combine(format.colorize(), format.simple()),
		}),
	],
})

// Function to clean old logs
const cleanOldLogs = async () => {
	try {
		const cutoffDate = subHours(new Date(), 24)
		const tempFile = join(process.cwd(), 'logs/temp.log')
		const logFile = join(process.cwd(), 'logs/requests.log')

		const writeStream = createWriteStream(tempFile)
		const readStream = createReadStream(logFile)
		const rl = createInterface({
			input: readStream,
			crlfDelay: Infinity,
		})

		// Filter logs and write to temp file
		for await (const line of rl) {
			try {
				const log = JSON.parse(line)
				if (new Date(log.timestamp) > cutoffDate) {
					writeStream.write(line + '\n')
				}
			} catch (e) {
				console.error('Error parsing log line:', e)
			}
		}

		// Close streams
		await new Promise((resolve) => writeStream.end(resolve))

		// Replace original file with filtered logs
		writeFileSync(logFile, '')
		const finalStream = createReadStream(tempFile)
		finalStream.pipe(createWriteStream(logFile))
	} catch (error) {
		console.error('Error cleaning logs:', error)
	}
}

export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const startTime = Date.now()

	if (req.path.includes('.php')) {
		// DO NOT LOG PHP REQUESTS as they are not real requests but rather bots
		return
	}

	// Capture response data after request is finished
	res.on('finish', () => {
		const ip = req.ip || req.socket.remoteAddress || ''
		const geo = geoip.lookup(ip)
		const ua = new UAParser(req.headers['user-agent'])
		const browser = ua.getBrowser()
		const os = ua.getOS()

		const logData = {
			timestamp: new Date().toISOString(),
			method: req.method,
			path: req.path,
			status: res.statusCode,
			responseTime: Date.now() - startTime,
			ip,
			location:
				geo ?
					{
						country: geo.country,
						region: geo.region,
						city: geo.city,
						timezone: geo.timezone,
					}
				:	null,
			userAgent: {
				browser: `${browser.name} ${browser.version}`,
				os: `${os.name} ${os.version}`,
			},
			referer: req.headers.referer || null,
			query: req.query,
			body: req.method !== 'GET' ? req.body : undefined,
			headers: {
				...req.headers,
				// Remove sensitive headers
				authorization: req.headers.authorization ? '[REDACTED]' : undefined,
				cookie: req.headers.cookie ? '[REDACTED]' : undefined,
			},
		}

		// Log different levels based on status code
		if (res.statusCode >= 500) {
			logger.error('Request failed', logData)
		} else if (res.statusCode >= 400) {
			logger.warn('Request error', logData)
		} else {
			logger.info('Request completed', logData)
		}
	})

	next()
}
