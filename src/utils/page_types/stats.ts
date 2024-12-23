export function stats(content: string) {
    const stats = content.split('|').map((item) => item.trim())
    return `
        <section class="stats-section py-5">
            <div class="container">
                <div class="row g-4">
                    ${stats.map((stat) => `
                        <div class="col-md-3">
                            <div class="stat-item text-center">
                                ${stat}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `
} 