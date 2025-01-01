interface INavigationLink {
	title: string
	url?: string
	icon?: string
	children?: INavigationLink[]
}

interface INavigation {
	main_links: INavigationLink[]
	footer_links?: INavigationLink[]
}

// New type for nested variables
type NestedVariable = {
	[key: string]: string | number | boolean | NestedVariable
}

interface ISkill {
	title: string
	description: string
	icon: string
	tags: string[]
}

interface IProject {
	title: string
	description: string
	image?: string
	technologies?: string[]
	url?: string
}

interface ITestimonial {
	content: string
	name: string
	title: string
	avatar?: string
}

export interface IConfig {
	app: {
		name: string
		navbar_brand: string
		username: string
		user_description: string
		featured_skills?: ISkill[]
		featured_projects?: IProject[]
		testimonials?: ITestimonial[]
	}
	seo: {
		description: string
		twitter_handle?: string
		keywords: string
		author: string
		type: string
	}
	analytics?: {
		google_analytics?: string
		google_ads?: string
		google_tag_manager?: string
		microsoft_clarity?: string
		facebook_pixel?: string
	}
	contact?: {
		email?: string
		discord?: {
			invite: string
			name: string
		}
	}
	navigation: INavigation
	bsky?: {
		username: string
	}
	profile: {
		image: string
	}
	variables?: NestedVariable
	media_paths?: {
		// Something like: /home/user/Pictures  \\
		[key: string]: string
	}
	rate_limit?: {
		enabled: boolean
		window_ms?: number
		max?: number
		message?: string
	}
}
