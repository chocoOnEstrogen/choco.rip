import cron from 'node-cron'

interface CronJob {
	name: string
	schedule: string
	task: () => void | Promise<void>
	onError?: (error: Error) => void
	onComplete?: () => void
	enabled?: boolean
	timeout?: number
}

function formatCronSchedule(schedule: string): string {
	const [minute, hour, dayOfMonth, month, dayOfWeek] = schedule.split(' ')

	const formatTime = (value: string, unit: string) => {
		if (value === '*') return `every ${unit}`
		if (value.includes('/')) {
			const [_, interval] = value.split('/')
			return `every ${interval} ${unit}s`
		}
		if (value.includes(',')) {
			return `at ${unit}s ${value}`
		}
		return `at ${unit} ${value}`
	}

	const formatDayOfWeek = (value: string) => {
		const days = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
		]
		if (value === '*') return 'every day'
		if (value.includes(',')) {
			return (
				'on ' +
				value
					.split(',')
					.map((d) => days[parseInt(d)])
					.join(' and ')
			)
		}
		return `on ${days[parseInt(value)]}`
	}

	const formatMonth = (value: string) => {
		const months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		]
		if (value === '*') return ''
		if (value.includes(',')) {
			return (
				'in ' +
				value
					.split(',')
					.map((m) => months[parseInt(m) - 1])
					.join(' and ')
			)
		}
		return `in ${months[parseInt(value) - 1]}`
	}

	let readable = ''

	// Handle time
	if (minute !== '*' || hour !== '*') {
		readable += `Runs ${formatTime(minute, 'minute')}`
		if (hour !== '*') {
			readable += ` ${formatTime(hour, 'hour')}`
		}
	} else {
		readable += 'Runs every minute'
	}

	// Handle day of month
	if (dayOfMonth !== '*') {
		readable += ` on day ${dayOfMonth} of the month`
	}

	// Handle month
	if (month !== '*') {
		readable += ` ${formatMonth(month)}`
	}

	// Handle day of week
	if (dayOfWeek !== '*') {
		readable += ` ${formatDayOfWeek(dayOfWeek)}`
	}

	return readable
}

// Add type for valid cron schedule
type CronSchedule =
	`${number | '*'} ${number | '*'} ${number | '*'} ${number | '*'} ${number | '*'}`

class CronService {
	private jobs: Map<string, cron.ScheduledTask> = new Map()
	private static instance: CronService

	private constructor() {}

	static getInstance(): CronService {
		if (!CronService.instance) {
			CronService.instance = new CronService()
		}
		return CronService.instance
	}

	registerJob(job: CronJob | readonly CronJob[]): void {
		const jobs = Array.isArray(job) ? job : [job]

		jobs.forEach((j) => {
			if (this.jobs.has(j.name)) {
				throw new Error(`Job with name ${j.name} already exists`)
			}

			// Add type assertion to ensure schedule is valid
			if (!this.isValidCronSchedule(j.schedule)) {
				throw new Error(`Invalid cron schedule: ${j.schedule}`)
			}

			const scheduledJob = cron.schedule(
				j.schedule,
				async () => {
					if (j.enabled === false) return

					try {
						const timeoutPromise =
							j.timeout ?
								new Promise((_, reject) =>
									setTimeout(
										() => reject(new Error('Job timed out')),
										j.timeout,
									),
								)
							:	null

						const taskPromise = j.task()

						await Promise.race([taskPromise, timeoutPromise].filter(Boolean))

						j.onComplete?.()
					} catch (error) {
						j.onError?.(error as Error)
					}
				},
				{
					scheduled: false,
				},
			)

			this.jobs.set(j.name, scheduledJob)
		})
	}

	// Add helper method to validate cron schedule
	private isValidCronSchedule(schedule: string): schedule is CronSchedule {
		return cron.validate(schedule)
	}

	start(jobName?: string): void {
		if (jobName) {
			const job = this.jobs.get(jobName)
			if (!job) {
				throw new Error(`Job ${jobName} not found`)
			}
			job.start()
		} else {
			this.jobs.forEach((job) => job.start())
		}
	}

	stop(jobName?: string): void {
		if (jobName) {
			const job = this.jobs.get(jobName)
			if (!job) {
				throw new Error(`Job ${jobName} not found`)
			}
			job.stop()
		} else {
			this.jobs.forEach((job) => job.stop())
		}
	}

	removeJob(jobName: string): void {
		const job = this.jobs.get(jobName)
		if (job) {
			job.stop()
			this.jobs.delete(jobName)
		}
	}
}

// Export the type and class
export type { CronJob, CronSchedule }
export { CronService }
