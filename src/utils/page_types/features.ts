export function features(content: string) {
    const features = content.split('|').map((item) => item.trim())
    return `
        <section class="features-section py-5">
            <div class="container">
                <div class="row g-4">
                    ${features.map((feature) => `
                        <div class="col-md-4">
                            <div class="feature-item">
                                ${feature}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `
} 