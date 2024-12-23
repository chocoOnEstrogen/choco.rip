function extractImage(content: string) {
    const src = content.match(/src="([^"]+)"/)?.[1]
    const alt = content.match(/alt="([^"]+)"/)?.[1]
    return { src, alt }
}

export function gallery(content: string) {
    const images = content.split('|').map((item) => item.trim())
    const imageData = images.map((image, index) => ({
        ...extractImage(image),
        id: `gallery-${index}`
    }))

    return `
        <section class="gallery-section py-5">
            <div class="container">
                <div class="row g-4">
                    ${imageData.map(({ src, alt, id }) => `
                        <div class="col-md-4">
                            <div class="gallery-item">
                                <img 
                                    src="${src}" 
                                    alt="${alt}" 
                                    class="img-fluid cursor-pointer" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#${id}"
                                    style="cursor: pointer;"
                                >
                            </div>
                        </div>
                        <div class="modal fade" id="${id}" tabindex="-1" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-lg">
                                <div class="modal-content bg-glass">
                                    <div class="modal-header">
                                        <h5 class="modal-title">${alt}</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body text-center">
                                        <img src="${src}" alt="${alt}" class="img-fluid">
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `
} 