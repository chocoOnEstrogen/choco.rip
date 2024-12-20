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

export interface IConfig {
	app: {
		name: string
		navbar_brand: string
		username: string
		user_description: string
	}
	seo: {
		description: string
		twitter_handle?: string
		keywords: string
		author: string
		type: string
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
}
