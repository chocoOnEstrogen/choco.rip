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
                description: 'The number of projects to display',
                required: false,
                default: 10,
                validator: (value: number) => value > 0 && value <= 50,
            },
            featured: {
                type: 'boolean',
                description: 'Show only featured projects',
                required: false,
                default: false,
            },
            help: {
                type: 'boolean',
                description: 'Show this help message',
                required: false,
                default: false,
            }
        });
    }

    async execute(args: string[]): Promise<string> {
        const parsedArgs = this.parseArgs(args);
        
        if (parsedArgs.help) {
            return this.generateHelp();
        }

        const typedProjects = projects as Project[];
        let filteredProjects = typedProjects;

        if (parsedArgs.featured) {
            filteredProjects = filteredProjects.filter(project => project.featured);
        }

        const length = Math.min(parsedArgs.length as number, filteredProjects.length);
        const projectsToShow = filteredProjects.slice(0, length);

        if (projectsToShow.length === 0) {
            return 'No projects found matching the criteria.';
        }

        const projectsHtml = projectsToShow.map(project => `
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