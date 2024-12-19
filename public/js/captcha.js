class CustomCaptcha {
	constructor(containerId, options = {}) {
		this.container = document.getElementById(containerId)
		this.options = {
			length: options.length || 6,
			width: options.width || 200,
			height: options.height || 60,
			font: options.font || '32px Arial',
			chars:
				options.chars ||
				'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789',
			...options,
		}

		this.canvas = document.createElement('canvas')
		this.context = this.canvas.getContext('2d')
		this.captchaText = ''

		this.init()
	}

	init() {
		// Create canvas
		this.canvas.width = this.options.width
		this.canvas.height = this.options.height
		this.canvas.classList.add('captcha-canvas')

		// Create refresh button
		const refreshBtn = document.createElement('button')
		refreshBtn.type = 'button'
		refreshBtn.classList.add('btn', 'btn-link', 'captcha-refresh')
		refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>'
		refreshBtn.addEventListener('click', () => this.refresh())

		// Create wrapper
		const wrapper = document.createElement('div')
		wrapper.classList.add(
			'captcha-wrapper',
			'd-flex',
			'align-items-center',
			'gap-2',
			'mb-3',
		)
		wrapper.appendChild(this.canvas)
		wrapper.appendChild(refreshBtn)

		// Create input
		const input = document.createElement('input')
		input.type = 'text'
		input.name = 'captcha'
		input.required = true
		input.classList.add('form-control', 'captcha-input')
		input.placeholder = 'Enter the code above'
		input.autocomplete = 'off'

		// Add elements to container
		this.container.appendChild(wrapper)
		this.container.appendChild(input)

		// Generate initial captcha
		this.refresh()
	}

	generateText() {
		let text = ''
		for (let i = 0; i < this.options.length; i++) {
			text += this.options.chars.charAt(
				Math.floor(Math.random() * this.options.chars.length),
			)
		}
		return text
	}

	drawLine() {
		const { width, height } = this.options
		this.context.beginPath()
		this.context.moveTo(Math.random() * width, Math.random() * height)
		this.context.lineTo(Math.random() * width, Math.random() * height)
		this.context.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`
		this.context.stroke()
	}

	drawText() {
		const { width, height, font } = this.options
		this.context.font = font
		this.context.textAlign = 'center'
		this.context.textBaseline = 'middle'

		const chars = this.captchaText.split('')
		const charWidth = width / (chars.length + 2)

		chars.forEach((char, i) => {
			const x = (i + 1) * charWidth
			const y = height / 2 + (Math.random() * 10 - 5)
			const rotation = ((Math.random() * 30 - 15) * Math.PI) / 180

			this.context.save()
			this.context.translate(x, y)
			this.context.rotate(rotation)
			this.context.fillStyle = `rgb(${Math.random() * 100},${Math.random() * 100},${Math.random() * 100})`
			this.context.fillText(char, 0, 0)
			this.context.restore()
		})
	}

	refresh() {
		const { width, height } = this.options

		// Clear canvas
		this.context.fillStyle = '#ffffff'
		this.context.fillRect(0, 0, width, height)

		// Generate new text
		this.captchaText = this.generateText()

		// Draw noise lines
		for (let i = 0; i < 5; i++) {
			this.drawLine()
		}

		// Draw text
		this.drawText()

		// Draw noise dots
		for (let i = 0; i < 50; i++) {
			const x = Math.random() * width
			const y = Math.random() * height
			this.context.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`
			this.context.fillRect(x, y, 2, 2)
		}
	}

	verify(input) {
		return input.toLowerCase() === this.captchaText.toLowerCase()
	}
}
