export function grid(content: string) {
	const items = content.split('|').map((item) => item.trim())
	return `
		<section class="grid-section py-5">
			<div class="container">
				<div class="row g-4">
					${items.map((item) => `<div class="col-md-${12 / items.length}">${item}</div>`).join('')}
				</div>
			</div>
		</section>
	`
}
