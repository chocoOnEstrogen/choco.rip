export * from './grid'
export * from './hero'
export * from './content'
export * from './iframe'
export * from './features'
export * from './cta'
export * from './gallery'
export * from './testimonials'
export * from './modal'
export * from './stats'
export * from './faq'
export * from './raw'

export function defaultType(content: string) {
    return `
        <section class="py-5">
            <div class="container">
                ${content}
            </div>
        </section>
    `
}
