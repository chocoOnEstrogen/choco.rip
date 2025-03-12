import { Command } from '../classes/command';
import tech from '../json/tech.json';

interface TechItem {
    name: string;
    icon: string;
    color: string;
    category: string;
}

interface TechCategories {
    [key: string]: TechItem[];
}

export class TechCommand extends Command {
    constructor() {
        super('tech', 'View my tech stack');
    }

    async execute(): Promise<string> {
        const typedTech = tech as TechItem[];
        const techByCategory = typedTech.reduce<TechCategories>((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});

        const techHtml = Object.entries(techByCategory).map(([category, items]) => `
            <div class="tech-category mb-4">
                <div class="text-everforest-green font-bold mb-2">${category}</div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                    ${items.map((item: TechItem) => `
                        <div class="tech-item ${item.color} p-2 rounded flex items-center gap-2">
                            <i class="${item.icon}"></i>
                            <span>${item.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        return `<div class="tech-container">${techHtml}</div>`;
    }
} 