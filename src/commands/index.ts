import { ClearCommand } from './clear';
import { PartnersCommand } from './partners';
import { ContactCommand } from './contact';
import { NeofetchCommand } from './neofetch';
import { GotoCommand } from './goto';
import { ExperienceCommand } from './exp';
import { ProjectsCommand } from './projects';
import { TechCommand } from './tech';
import { PagesCommand } from './pages';
import { SocialsCommand } from './socials';
export const commands = [
    new ClearCommand(),
    new PartnersCommand(),
    new ContactCommand(),
    new NeofetchCommand(),
    new GotoCommand(),
    new ExperienceCommand(),
    new ProjectsCommand(),
    new TechCommand(),
    new PagesCommand(),
    new SocialsCommand(),
];
