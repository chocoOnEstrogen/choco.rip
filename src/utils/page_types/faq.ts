export function faq(content: string) {
    const faqs = content.split('|').map((item) => item.trim())
    return `
        <section class="faq-section py-5">
            <div class="container">
                <div class="accordion" id="faqAccordion">
                    ${faqs.map((faq, index) => `
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="heading${index}">
                                <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="${index === 0}" aria-controls="collapse${index}">
                                    FAQ Item ${index + 1}
                                </button>
                            </h2>
                            <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading${index}" data-bs-parent="#faqAccordion">
                                <div class="accordion-body">
                                    ${faq}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `
} 