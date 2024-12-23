export function testimonials(content: string) {
    const testimonials = content.split('|').map((item) => item.trim())
    return `
        <section class="testimonials-section py-5">
            <div class="container">
                <div class="row g-4">
                    ${testimonials.map((testimonial) => `
                        <div class="col-md-4">
                            <div class="testimonial-item">
                                ${testimonial}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `
} 