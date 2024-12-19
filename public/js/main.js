let settingsModalOpen = false

document.addEventListener('DOMContentLoaded', function () {
	// Theme Management
	const initTheme = () => {
		const savedTheme =
			localStorage.getItem('theme') ||
			(window.matchMedia('(prefers-color-scheme: dark)').matches ?
				'dark'
			:	'light')

		document.documentElement.setAttribute('data-theme', savedTheme)

		const themeToggle = document.querySelector('.theme-toggle')
		if (themeToggle) {
			const moonIcon = themeToggle.querySelector('#moon')
			const sunIcon = themeToggle.querySelector('#sun')

			if (savedTheme === 'dark') {
				moonIcon.style.display = 'none'
				sunIcon.style.display = 'inline-block'
			} else {
				moonIcon.style.display = 'inline-block'
				sunIcon.style.display = 'none'
			}
		}
	}

	// Theme Toggle Function
	const toggleTheme = () => {
		const currentTheme = document.documentElement.getAttribute('data-theme')
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

		document.documentElement.setAttribute('data-theme', newTheme)
		localStorage.setItem('theme', newTheme)

		const themeToggle = document.querySelector('.theme-toggle')
		if (themeToggle) {
			const moonIcon = themeToggle.querySelector('#moon')
			const sunIcon = themeToggle.querySelector('#sun')

			if (newTheme === 'dark') {
				moonIcon.style.display = 'none'
				sunIcon.style.display = 'inline-block'
			} else {
				moonIcon.style.display = 'inline-block'
				sunIcon.style.display = 'none'
			}
		}
	}

	// Initialize theme
	initTheme()

	// Add theme toggle event listener
	const themeToggle = document.querySelector('.theme-toggle')
	if (themeToggle) {
		themeToggle.addEventListener('click', toggleTheme)
	}

	// Enhanced Navbar Scroll Effect
	const navbar = document.querySelector('.navbar')
	let lastScroll = 0

	window.addEventListener('scroll', () => {
		const currentScroll = window.pageYOffset

		if (currentScroll > 50) {
			navbar.classList.add('navbar-scrolled', 'shadow')
		} else {
			navbar.classList.remove('navbar-scrolled', 'shadow')
		}

		// Hide/Show navbar on scroll
		if (currentScroll > lastScroll && currentScroll > 500) {
			navbar.style.transform = 'translateY(-100%)'
		} else {
			navbar.style.transform = 'translateY(0)'
		}
		lastScroll = currentScroll

		// Update scroll progress
		const scrollProgress = document.querySelector('.scroll-progress')
		if (scrollProgress) {
			const scrollPercent =
				(window.scrollY /
					(document.documentElement.scrollHeight - window.innerHeight)) *
				100
			scrollProgress.style.transform = `scaleX(${scrollPercent / 100})`
		}
	})

	// Smooth Scroll with Progress Indicator
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault()
			const target = document.querySelector(this.getAttribute('href'))

			// Update active nav item
			document.querySelectorAll('.nav-link').forEach((link) => {
				link.classList.remove('active')
			})
			this.classList.add('active')

			// Smooth scroll to target
			if (target) {
				target.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				})
			}
		})
	})

	// Enhanced Intersection Observer for Animations
	const animateElements = (elements, className) => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add(className)
					}
				})
			},
			{
				threshold: 0.1,
				rootMargin: '0px 0px -50px 0px',
			},
		)

		elements.forEach((el) => observer.observe(el))
	}

	// Apply different animations
	animateElements(document.querySelectorAll('.fade-in'), 'visible')
	animateElements(document.querySelectorAll('.slide-in-left'), 'visible')

	// Typing Effect for Hero Section
	const typeWriter = (element, text, speed = 100) => {
		let i = 0
		element.innerHTML = ''

		function type() {
			if (i < text.length) {
				element.innerHTML += text.charAt(i)
				i++
				setTimeout(type, speed)
			}
		}

		type()
	}

	const heroTitle = document.querySelector('.hero-title')
	if (heroTitle) {
		typeWriter(heroTitle, heroTitle.dataset.text || heroTitle.textContent)
	}

	// Parallax Effect
	document.addEventListener('mousemove', (e) => {
		document.querySelectorAll('.parallax').forEach((layer) => {
			const speed = layer.dataset.speed || 1
			const x = (window.innerWidth - e.pageX * speed) / 100
			const y = (window.innerHeight - e.pageY * speed) / 100
			layer.style.transform = `translateX(${x}px) translateY(${y}px)`
		})
	})

	// Project Filter System
	const filterProjects = (category) => {
		const projects = document.querySelectorAll('.project-card')

		projects.forEach((project) => {
			const projectCategory = project.dataset.category
			if (category === 'all' || projectCategory === category) {
				project.style.display = 'block'
				setTimeout(() => {
					project.style.opacity = '1'
					project.style.transform = 'scale(1)'
				}, 100)
			} else {
				project.style.opacity = '0'
				project.style.transform = 'scale(0.8)'
				setTimeout(() => {
					project.style.display = 'none'
				}, 300)
			}
		})
	}

	// Initialize project filters
	const filterButtons = document.querySelectorAll('.filter-btn')
	filterButtons.forEach((btn) => {
		btn.addEventListener('click', () => {
			filterButtons.forEach((b) => b.classList.remove('active'))
			btn.classList.add('active')
			filterProjects(btn.dataset.filter)
		})
	})

	// Listen for system theme changes
	window
		.matchMedia('(prefers-color-scheme: dark)')
		.addEventListener('change', (e) => {
			const newTheme = e.matches ? 'dark' : 'light'
			document.documentElement.setAttribute('data-theme', newTheme)
			localStorage.setItem('theme', newTheme)

			// Update toggle button icons
			const moonIcon = document.querySelector('#moon')
			const sunIcon = document.querySelector('#sun')
			if (moonIcon && sunIcon) {
				if (newTheme === 'dark') {
					moonIcon.style.display = 'none'
					sunIcon.style.display = 'inline-block'
				} else {
					moonIcon.style.display = 'inline-block'
					sunIcon.style.display = 'none'
				}
			}
		})

	const updateScrollProgress = () => {
		const scrollProgress = document.querySelector('.scroll-progress')
		const scrollPercent =
			(window.scrollY /
				(document.documentElement.scrollHeight - window.innerHeight)) *
			100
		scrollProgress.style.transform = `scaleX(${scrollPercent / 100})`
	}

	window.addEventListener('scroll', updateScrollProgress)

	// Initialize Tooltips
	const initTooltips = () => {
		const tooltipTriggerList = document.querySelectorAll(
			'[data-bs-toggle="tooltip"]',
		)
		;[...tooltipTriggerList].map(
			(tooltipTriggerEl) =>
				new bootstrap.Tooltip(tooltipTriggerEl, {
					placement: 'top',
					trigger: 'hover',
				}),
		)
	}

	// Initialize tooltips
	initTooltips()

	// Add keyboard shortcut for theme toggle
	document.addEventListener('keydown', (e) => {
		// Check for Ctrl/Cmd + K
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault() // Prevent default browser behavior
			toggleTheme()
		}

		// Check for Ctrl/Cmd + S
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
			e.preventDefault()
			if (settingsModalOpen) {
				return
			}
			// Prevent default browser behavior
			const settingsModal = new bootstrap.Modal(
				document.getElementById('settingsModal'),
			)
			settingsModal.show()
			settingsModalOpen = true
		}
	})

	// Settings Management
	const initSettings = () => {
		// Load settings from localStorage
		const settings = JSON.parse(localStorage.getItem('settings') || '{}')

		// Initialize switches with saved values or defaults
		const onekoSwitch = document.getElementById('onekoSwitch')
		if (onekoSwitch) {
			onekoSwitch.checked = settings.enableOneko !== false // Default to true
		}

		// Apply settings
		applySettings(settings)
	}

	const applySettings = (settings) => {
		// Apply Oneko setting
		if (settings.enableOneko === false) {
			const oneko = document.getElementById('oneko')
			if (oneko) oneko.remove()
		}
	}

	const saveSettings = () => {
		const settings = {
			enableOneko: document.getElementById('onekoSwitch').checked,
		}

		// Save to localStorage
		localStorage.setItem('settings', JSON.stringify(settings))

		// Apply settings
		applySettings(settings)

		// Show success message
		const toast = new bootstrap.Toast(document.getElementById('settingsToast'))
		toast.show()
	}

	// Initialize settings
	initSettings()

	// Add save button event listener
	const saveSettingsBtn = document.querySelector('#settingsModal .btn-primary')
	if (saveSettingsBtn) {
		saveSettingsBtn.addEventListener('click', () => {
			saveSettings()
			const modal = bootstrap.Modal.getInstance(
				document.getElementById('settingsModal'),
			)
			modal.hide()
			settingsModalOpen = false
		})
	}

	// Close settings modal when clicking outside
	const settingsModal = document.getElementById('settingsModal')
	if (settingsModal) {
		settingsModal.addEventListener('click', (e) => {
			if (e.target === settingsModal) {
				modal.hide()
				settingsModalOpen = false
			}
		})
	}
})

// Preloader
window.addEventListener('load', () => {
	const preloader = document.querySelector('.preloader')
	const loadingAnimation = document.querySelector('.loading-animation')

	if (preloader) {
		preloader.classList.add('preloader-finish')
		setTimeout(() => {
			preloader.style.display = 'none'
			if (loadingAnimation) {
				loadingAnimation.style.display = 'none'
			}
		}, 500)
	}
})
