import yaml from 'js-yaml'

function parseSection(type: string, content: string): string {
	switch (type) {
		case 'hero':
			return `
				<section class="hero-section text-center py-5 position-relative">
					<div class="container">
						<div class="hero-content">
							${content}
						</div>
					</div>
				</section>
			`
		case 'content':
			return `
				<section class="content-section py-5">
					<div class="container">
						${content}
					</div>
				</section>
			`
		case 'grid':
			const items = content.split('|').map((item) => item.trim())
			return `
				<section class="grid-section py-5">
					<div class="container">
						<div class="row g-4">
							${items
								.map(
									(item) => `
								<div class="col-md-${12 / items.length}">
									${item}
								</div>
							`,
								)
								.join('')}
						</div>
					</div>
				</section>
			`
		case 'features':
			const features = content.split('|').map((item) => item.trim())
			return `
				<section class="features-section py-5">
					<div class="container">
						<div class="row g-4">
							${features
								.map(
									(feature) => `
								<div class="col-md-4">
									<div class="feature-card bg-glass h-100 p-4 rounded-3">
										${feature}
									</div>
								</div>
							`,
								)
								.join('')}
						</div>
					</div>
				</section>
			`
		case 'cta':
			return `
				<section class="cta-section text-center py-5 my-5 bg-glass">
					<div class="container">
						${content}
					</div>
				</section>
			`
		case 'gallery':
			const images = content.split('|').map((item) => item.trim())
			return `
				<section class="gallery-section py-5">
					<div class="container">
						<div class="row g-4">
							${images
								.map(
									(image) => `
								<div class="col-md-4">
									<div class="gallery-item">
										${image}
									</div>
								</div>
							`,
								)
								.join('')}
						</div>
					</div>
				</section>
			`
		case 'testimonials':
			const testimonials = content.split('|').map((item) => item.trim())
			return `
				<section class="testimonials-section py-5">
					<div class="container">
						<div class="row g-4">
							${testimonials
								.map(
									(testimonial) => `
								<div class="col-md-4">
									<div class="testimonial-card bg-glass p-4 rounded-3">
										${testimonial}
									</div>
								</div>
							`,
								)
								.join('')}
						</div>
					</div>
				</section>
			`
		case 'stats':
			const stats = content.split('|').map((item) => item.trim())
			return `
				<section class="stats-section py-5">
					<div class="container">
						<div class="row g-4">
							${stats
								.map(
									(stat) => `
								<div class="col-md-3">
									<div class="stat-card text-center bg-glass p-4 rounded-3">
										${stat}
									</div>
								</div>
							`,
								)
								.join('')}
						</div>
					</div>
				</section>
			`
		case 'faq':
			const faqs = content.split('|').map((item) => item.trim())
			return `
				<section class="faq-section py-5">
					<div class="container">
						<div class="accordion" id="faqAccordion">
							${faqs
								.map(
									(faq, index) => `
								<div class="accordion-item bg-glass">
									${faq}
								</div>
							`,
								)
								.join('')}
						</div>
					</div>
				</section>
			`
		case 'raw':
			return content
		default:
			return `
				<section class="py-5">
					<div class="container">
						${content}
					</div>
				</section>
			`
	}
}

async function parsePageFile(content: string) {
	const parts = content.split('---\n')

	if (parts.length < 3) {
		throw new Error(
			'Invalid .page file format. Expected frontmatter between --- markers.',
		)
	}

	const config = yaml.load(parts[1]) || {}
	const template = parts.slice(2).join('---\n').trim()
	const sections = template.split('::')

	let html = ''

	sections.forEach((section) => {
		const [type, ...content] = section.trim().split('\n')
		const sectionContent = content.join('\n').trim()
		html += parseSection(type, sectionContent)
	})

	return { config, html }
}

export { parsePageFile, parseSection }
