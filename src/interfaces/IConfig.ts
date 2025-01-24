/**
 * Configuration interface for the website
 */
export default interface IConfig {
    /** Title of the website */
    title: string;
    /** Description of the website */
    description: string;
    /** Base URL of the website */
    url: string;
    /** Default social sharing image URL */
    image: string;
    
    /** Author information */
    author: {
        /** Author's full name */
        name: string;
        /** Author's role/title */
        role: string;
        /** Author's email address */
        email: string;
        /** Social media links mapped by platform name */
        social: {
            [key: string]: string;
        };
        /** Optional Discord server invite link */
        discord?: string;
    };
    /** Site-wide settings */
    site: {
        /** Site language code (e.g. 'en') */
        language: string;
        /** Primary theme color */
        themeColor: string;
        /** Analytics configuration */
        analytics?: {
            /** Google Analytics ID */
            googleId?: string;
            /** Plausible Analytics domain */
            plausibleDomain?: string;
        };
    };
    /** Navigation configuration */
    navigation: {
        /** Primary navigation menu items */
        primary: Array<{
            /** Display name of the navigation item */
            name: string;
            /** URL path for the navigation item */
            path: string;
        }>;
    };
}