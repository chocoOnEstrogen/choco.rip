document.addEventListener('DOMContentLoaded', function () {
	// Initialize components
	initializeTOC()
	initializeSearch()
	// initializeSettings()
	initializeCodeBlocks()
	// Handle scroll spy
	window.addEventListener('scroll', debounce(handleScrollSpy, 100))
})

function initializeTOC() {
	const content = document.querySelector('.docs-content')
	const toc = document.querySelector('.toc-nav')
	const headings = content.querySelectorAll('h2, h3, h4')
	const tocList = document.createElement('ul')

	headings.forEach((heading, index) => {
		// Add ID to heading if not present
		if (!heading.id) {
			heading.id = `heading-${index}`
		}

		const li = document.createElement('li')
		const a = document.createElement('a')
		a.href = `#${heading.id}`
		a.textContent = heading.textContent
		a.classList.add(`toc-${heading.tagName.toLowerCase()}`)

		li.appendChild(a)
		tocList.appendChild(li)
	})

	toc.appendChild(tocList)
}

function initializeSearch() {
	const searchInput = document.getElementById('docs-search')
	const navItems = document.querySelectorAll('.docs-nav-item')

	searchInput.addEventListener(
		'input',
		debounce((e) => {
			const query = e.target.value.toLowerCase()

			navItems.forEach((item) => {
				const text = item.textContent.toLowerCase()
				item.style.display = text.includes(query) ? '' : 'none'
			})
		}, 200),
	)
}

function initializeSettings() {
	// Line numbers toggle
	document.getElementById('toggleLineNumbers').addEventListener('click', () => {
		document.querySelectorAll('pre').forEach((pre) => {
			pre.classList.toggle('line-numbers')
		})
		localStorage.setItem(
			'docsLineNumbers',
			document.querySelector('pre').classList.contains('line-numbers'),
		)
	})

	// Font size controls
	let fontSize = parseInt(localStorage.getItem('docsFontSize')) || 16

	document.getElementById('increaseFontSize').addEventListener('click', () => {
		if (fontSize < 24) {
			fontSize += 1
			updateFontSize()
		}
	})

	document.getElementById('decreaseFontSize').addEventListener('click', () => {
		if (fontSize > 12) {
			fontSize -= 1
			updateFontSize()
		}
	})
}

function initializeCodeBlocks() {
	document.querySelectorAll('pre code').forEach((block) => {
		const pre = block.parentNode

		// Create wrapper
		const wrapper = document.createElement('div')
		wrapper.className = 'code-block-wrapper'

		// Get language and filename
		const language = block.className.match(/language-(\w+)/)?.[1] || 'text'

		// Create header with language info and actions
		const header = document.createElement('div')
		header.className = 'code-block-header'
		header.innerHTML = `
            <div class="code-block-language">
                <img src="/images/icons/programming/${language}.svg" alt="${language}" onerror="this.onerror=null; this.src='/images/icons/error.svg'; this.style.fill='var(--text-color)'" loading="lazy" decoding="async" />
            </div>
            <div class="code-block-actions">
                <button class="code-block-btn" title="Copy code">
                    <i class="fas fa-copy copy-icon"></i>
                </button>
            </div>
        `

		// Create content container
		const content = document.createElement('div')
		content.className = 'code-block-content'

		// Add line numbers
		pre.classList.add('line-numbers')
		addLineNumbers(pre, block)

		// Create footer with metadata
		const footer = document.createElement('div')
		footer.className = 'code-block-footer'
		const lines = block.textContent.trim().split('\n').length
		const chars = block.textContent.length
		footer.textContent = `${lines} lines · ${chars} characters`

		// Insert wrapper before pre
		pre.parentNode.insertBefore(wrapper, pre)

		// Move elements into wrapper
		wrapper.appendChild(header)
		content.appendChild(pre)
		wrapper.appendChild(content)
		wrapper.appendChild(footer)

		// Add event listeners
		const [copyBtn] = header.querySelectorAll('.code-block-btn')

		copyBtn.addEventListener('click', () => copyCode(block, copyBtn))
	})
}

function addLineNumbers(pre, block) {
	// Create line numbers container
	const lineNumbers = document.createElement('div')
	lineNumbers.className = 'line-numbers-rows'

	// Split the code into lines and create number spans
	const lines = block.textContent.split('\n')
	const numbers = lines.map((_, i) => `<span>${i + 1}</span>`).join('')
	lineNumbers.innerHTML = numbers

	// Add line numbers to pre element
	pre.insertBefore(lineNumbers, block)
}

async function copyCode(block, button) {
	try {
		await navigator.clipboard.writeText(block.textContent)
		button.innerHTML = '<i class="fas fa-check check-icon"></i>'
		button.classList.add('success')
		setTimeout(() => {
			button.innerHTML = '<i class="fas fa-copy copy-icon"></i>'
			button.classList.remove('success')
		}, 2000)
	} catch (err) {
		button.innerHTML = '<i class="fas fa-times error-icon"></i>'
		button.classList.add('error')
		setTimeout(() => {
			button.innerHTML = '<i class="fas fa-copy copy-icon"></i>'
			button.classList.remove('error')
		}, 2000)
	}
}

function toggleLineNumbers(pre) {
	pre.classList.toggle('line-numbers')
	const hasLineNumbers = pre.classList.contains('line-numbers')
	localStorage.setItem('codeLineNumbers', hasLineNumbers)

	if (hasLineNumbers && !pre.querySelector('.line-numbers-rows')) {
		addLineNumbers(pre, pre.querySelector('code'))
	}
}

function toggleWordWrap(block) {
	block.style.whiteSpace =
		block.style.whiteSpace === 'pre-wrap' ? 'pre' : 'pre-wrap'
}

function initializeLineHighlighting(block) {
	// Parse highlighting instructions from code comments or data attributes
	const highlights = block.dataset.highlight?.split(',') || []
	highlights.forEach((range) => {
		const [start, end] = range.split('-').map(Number)
		highlightLines(block, start, end || start)
	})
}

function highlightLines(block, start, end) {
	const lines = block.innerHTML.split('\n')
	for (let i = start - 1; i <= end - 1; i++) {
		if (lines[i]) {
			lines[i] = `<span class="highlight-line">${lines[i]}</span>`
		}
	}
	block.innerHTML = lines.join('\n')
}

function handleScrollSpy() {
	const headings = document.querySelectorAll(
		'.docs-content h2, .docs-content h3, .docs-content h4',
	)
	const tocLinks = document.querySelectorAll('.toc-nav a')

	let currentHeading = ''

	headings.forEach((heading) => {
		const rect = heading.getBoundingClientRect()
		if (rect.top <= 100) {
			currentHeading = `#${heading.id}`
		}
	})

	tocLinks.forEach((link) => {
		link.classList.toggle(
			'active',
			link.getAttribute('href') === currentHeading,
		)
	})
}

function debounce(func, wait) {
	let timeout
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout)
			func(...args)
		}
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
	}
}

// Helper function to update font size
function updateFontSize() {
	document.querySelector('.docs-content').style.fontSize = `${fontSize}px`
	localStorage.setItem('docsFontSize', fontSize)
}

// Mobile menu handling
const mobileMenuBtn = document.querySelector('.docs-mobile-menu')
const sidebar = document.querySelector('.docs-sidebar')
const searchToggle = document.querySelector('.navbar-search-toggle')
const searchOverlay = document.querySelector('.mobile-search-overlay')
const searchClose = document.querySelector('.mobile-search-close')

mobileMenuBtn?.addEventListener('click', () => {
	sidebar.classList.toggle('show')
})

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
	if (window.innerWidth <= 768) {
		if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
			sidebar.classList.remove('show')
		}
	}
})

// Mobile search handling
searchToggle?.addEventListener('click', () => {
	searchOverlay.style.display = 'block'
	searchOverlay.querySelector('input').focus()
})

searchClose?.addEventListener('click', () => {
	searchOverlay.style.display = 'none'
})
