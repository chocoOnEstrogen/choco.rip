export function gallery(content: string) {
    const images = content.split('|').map((item) => item.trim())
    return `
        <section class="gallery-section py-5">
            <div class="container">
                <div class="row g-4">
                    ${images.map((image) => `
                        <div class="col-md-4">
                            <div class="gallery-item">
                                ${image}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `
} 