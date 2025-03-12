import { Command } from '../classes/command';
import projects from '../json/projects.json';

interface Project {
    title: string;
    description: string;
    tags: string[];
    link?: string;
    git?: string;
    featured: boolean;
}

export class ProjectsCommand extends Command {
    constructor() {
        super('projects', 'View my projects', {
            length: {
                type: 'number',
                default: 10,
                required: false,
                description: 'The number of projects to display',
            },
        });
    }

    async execute(args: string[]): Promise<string> {
        const typedProjects = projects as Project[];
        const parsedArgs = this.parseArgs(args);
        const length = parsedArgs.length as number;
        const projectsHtml = typedProjects.slice(0, length).map(project => `
            <div class="project-item mb-4">
                <div class="flex items-center gap-2">
                    <span class="text-everforest-green font-bold">${project.title}</span>
                    ${project.featured ? '<span class="text-xs text-everforest-yellow">[Featured]</span>' : ''}
                </div>
                <p class="text-sm text-everforest-fg my-1">${project.description}</p>
                <div class="flex gap-2 text-xs">
                    ${project.tags.map(tag => `<span class="text-everforest-blue">#${tag}</span>`).join('')}
                </div>
                <div class="flex gap-3 mt-2 text-sm">
                    ${project.link ? `<a href="${project.link}" target="_blank" class="hover:underline">Demo</a>` : ''}
                    ${project.git ? `<a href="${project.git}" target="_blank" class="hover:underline">Source</a>` : ''}
                </div>
            </div>
        `).join('');
        return `<div class="projects-container">${projectsHtml}</div>`;
    }
} 