export function grid(content: string, options?: string) {
	// Parse options like 'cols-3' from the section declaration
	const cols = options?.match(/cols-(\d+)/)?.[1] || 3
	return `<section class="grid-section py-5 ${cols}">
	<div class="container">
		${content}
	</div>
</section>`
}
