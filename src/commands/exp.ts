import { Command } from '../classes/command';
import experience from '../json/experience.json';

interface Experience {
    role: string;
    company: string;
    period: string;
    description: string;
    highlights: string[];
}

export class ExperienceCommand extends Command {
    constructor() {
        super('exp', 'View my experience');
    }

    async execute(): Promise<string> {
        const typedExperience = experience as Experience[];
        const expHtml = typedExperience.map(exp => `
            <div class="exp-item mb-6">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-everforest-green font-bold">${exp.role}</span>
                        <span class="text-everforest-fg"> @ ${exp.company}</span>
                    </div>
                    <span class="text-sm text-everforest-yellow">${exp.period}</span>
                </div>
                <p class="text-sm text-everforest-fg mb-2">${exp.description}</p>
                <ul class="list-disc list-inside text-sm space-y-1">
                    ${exp.highlights.map(highlight => `
                        <li class="text-everforest-blue">${highlight}</li>
                    `).join('')}
                </ul>
            </div>
        `).join('');

        return `<div class="experience-container">${expHtml}</div>`;
    }
}