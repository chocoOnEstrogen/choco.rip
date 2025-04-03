export interface Config {
  /** Full name of the user */
  name: string;
  
  /** Brief description or bio */
  description: string;
  
  /** URL to profile avatar image */
  avatar: string;
  
  /** GitHub username */
  github: string;
  
  /** Contact email address */
  email: string;
  
  /** Website URL */
  url: string;
  
  /** Optional location information */
  location?: string;
  
  /** Optional social media links */
  socials?: {
    /** GitHub profile URL */
    github?: string;
    /** Discord username or invite link */
    discord?: string;
  };
}
