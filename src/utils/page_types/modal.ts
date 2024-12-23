export function modal(content: string) {
    const [id, title, modalContent] = content.split('|').map(item => item.trim())
    return `
        <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}Label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-glass">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${id}Label">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${modalContent}
                    </div>
                </div>
            </div>
        </div>
    `
}

export function modalButton(content: string) {
    const [modalId, label] = content.split('|').map(item => item.trim())
    return `
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${modalId}">${label}</button>
    `
} 