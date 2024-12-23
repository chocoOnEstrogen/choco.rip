export function iframe(content: string) {
    const [url, width, height] = content.split('|').map((item) => item.trim())
    return `
        <section class="iframe-section py-5">
            <div class="container">
                <iframe src="${url}" class="w-100 h-100" style="width: ${width}px; height: ${height}px;"></iframe>
            </div>
        </section>
    `
} 