export function hero(content: string) {
    return `
        <section class="hero-section text-center py-5 position-relative">
            <div class="container">
                <div class="hero-content">
                    ${content}
                </div>
            </div>
        </section>
    `
} 