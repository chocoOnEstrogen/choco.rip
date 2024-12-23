export function content(content: string) {
    return `
        <section class="content-section py-5">
            <div class="container">
                ${content}
            </div>
        </section>
    `
} 