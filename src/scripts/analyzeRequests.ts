import fs from 'fs'
import readline from 'readline'
import { program } from 'commander'
import chalk from 'chalk'

interface RequestLog {
	timestamp: string
	method: string
	path: string
	status: number
	responseTime: number
	ip: string
	location: {
		country: string
		region: string
		city: string
		timezone: string
	}
	userAgent: {
		browser: string
		os: string
	}
}

interface Analytics {
	totalRequests: number
	avgResponseTime: number
	statusCodes: Record<number, number>
	methods: Record<string, number>
	paths: Record<string, number>
	countries: Record<string, number>
	browsers: Record<string, number>
	operatingSystems: Record<string, number>
	slowestRequests: Array<{ path: string; time: number }>
	errors: Array<{ timestamp: string; path: string; status: number }>
}

export async function analyzeLogFile(
	filePath: string,
	options: {
		days?: number
		minTime?: number
	},
) {
	const analytics: Analytics = {
		totalRequests: 0,
		avgResponseTime: 0,
		statusCodes: {},
		methods: {},
		paths: {},
		countries: {},
		browsers: {},
		operatingSystems: {},
		slowestRequests: [],
		errors: [],
	}

	let totalResponseTime = 0
	const fileStream = fs.createReadStream(filePath)
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	})

	const cutoffDate =
		options.days ?
			new Date(Date.now() - options.days * 24 * 60 * 60 * 1000)
		:	new Date(0)

	for await (const line of rl) {
		try {
			const log: RequestLog = JSON.parse(line)
			const logDate = new Date(log.timestamp)

			if (logDate < cutoffDate) continue

			// Update analytics
			analytics.totalRequests++
			totalResponseTime += log.responseTime

			analytics.statusCodes[log.status] =
				(analytics.statusCodes[log.status] || 0) + 1
			analytics.methods[log.method] = (analytics.methods[log.method] || 0) + 1
			analytics.paths[log.path] = (analytics.paths[log.path] || 0) + 1

			if (log.location?.country) {
				analytics.countries[log.location.country] =
					(analytics.countries[log.location.country] || 0) + 1
			}

			if (log.userAgent.browser) {
				analytics.browsers[log.userAgent.browser] =
					(analytics.browsers[log.userAgent.browser] || 0) + 1
			}

			if (log.userAgent.os) {
				analytics.operatingSystems[log.userAgent.os] =
					(analytics.operatingSystems[log.userAgent.os] || 0) + 1
			}

			// Track slow requests
			if (!options.minTime || log.responseTime >= options.minTime) {
				analytics.slowestRequests.push({
					path: log.path,
					time: log.responseTime,
				})
			}

			// Track errors
			if (log.status >= 400) {
				analytics.errors.push({
					timestamp: log.timestamp,
					path: log.path,
					status: log.status,
				})
			}
		} catch (error) {
			console.error('Error parsing log line:', error)
		}
	}

	analytics.avgResponseTime = totalResponseTime / analytics.totalRequests
	analytics.slowestRequests.sort((a, b) => b.time - a.time)
	analytics.slowestRequests = analytics.slowestRequests.slice(0, 10)

	return analytics
}

function printAnalytics(analytics: Analytics) {
	console.log(chalk.bold('\n=== Request Log Analysis ===\n'))

	console.log(chalk.blue('General Statistics:'))
	console.log(`Total Requests: ${analytics.totalRequests}`)
	console.log(
		`Average Response Time: ${analytics.avgResponseTime.toFixed(2)}ms\n`,
	)

	console.log(chalk.blue('Status Codes:'))
	Object.entries(analytics.statusCodes)
		.sort(([, a], [, b]) => b - a)
		.forEach(([code, count]) => {
			const color =
				code.startsWith('2') ? 'green'
				: code.startsWith('4') ? 'yellow'
				: code.startsWith('5') ? 'red'
				: 'white'
			console.log(chalk[color](`${code}: ${count}`))
		})

	console.log(chalk.blue('\nTop 5 Paths:'))
	Object.entries(analytics.paths)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5)
		.forEach(([path, count]) => {
			console.log(`${path}: ${count}`)
		})

	console.log(chalk.blue('\nTop Countries:'))
	Object.entries(analytics.countries)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5)
		.forEach(([country, count]) => {
			console.log(`${country}: ${count}`)
		})

	console.log(chalk.blue('\nSlowest Requests:'))
	analytics.slowestRequests.forEach(({ path, time }) => {
		console.log(`${path}: ${time}ms`)
	})

	if (analytics.errors.length > 0) {
		console.log(chalk.red('\nRecent Errors:'))
		analytics.errors.slice(0, 5).forEach(({ timestamp, path, status }) => {
			console.log(`[${timestamp}] ${status} - ${path}`)
		})
	}
}

// CLI setup
if (require.main === module) {
	program
		.name('analyze-requests')
		.description('Analyze request logs')
		.option('-d, --days <number>', 'Only analyze logs from the last N days')
		.option('-m, --min-time <number>', 'Minimum response time to track (ms)')
		.action(async (options) => {
			const analytics = await analyzeLogFile('logs/requests.log', {
				days: options.days ? parseInt(options.days) : undefined,
				minTime: options.minTime ? parseInt(options.minTime) : undefined,
			})
			printAnalytics(analytics)
		})

	program.parse()
}
