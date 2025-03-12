import { Command } from '../classes/command';

export class PartnersCommand extends Command {
    private readonly partners = [
        {
            name: 'Vampiress Noir',
            url: 'https://bsky.app/profile/vampiressnoir.bsky.social',
            avatar: '/images/partners/vampiressnoir.jpeg'
        },
        {
            name: 'Blanche',
            url: 'https://bsky.app/profile/blanchevt.bsky.social',
            avatar: '/images/partners/blanche.jpeg'
        }
    ];

    constructor() {
        super('partners', 'Display information about my partners');
    }

    async execute(): Promise<string> {
        const partnerCards = this.partners
            .map(partner => `
                <a href="${partner.url}" 
                   class="flex items-center gap-2 p-4 rounded-lg bg-[#2A2D37] hover:bg-[#313244] transition-colors"
                   target="_blank" 
                   rel="noopener noreferrer">
                    <img src="${partner.avatar}" 
                         alt="${partner.name}'s avatar"
                         class="w-10 h-10 rounded-full" 
                         loading="lazy" />
                    <span class="text-[#A7C080]">${partner.name}</span>
                </a>
            `)
            .join('\n');

        return `
            <div class="flex flex-col gap-3">
                <h2 class="text-[#A7C080] mb-4">My Partners</h2>
                <div class="space-y-2">
                    ${partnerCards}
                </div>
            </div>
        `;
    }
}