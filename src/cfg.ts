interface NavigationLink {
	title: string
	url?: string
	icon?: string
	children?: NavigationLink[]
}

interface Navigation {
	main_links: NavigationLink[]
	footer_links?: NavigationLink[]
}

interface Config {
	contact?: {
		email?: string
		discord?: {
			invite: string
			name: string
		}
	}
	navigation: Navigation
	bsky?: {
		username: string
	}
}

const config: Config = {
	contact: {
		email: 'choco@choco.rip',
		discord: {
			invite: 'https://discord.gg/x8A89TVJUv',
			name: "Choco's Hub",
		},
	},
	navigation: {
		main_links: [
			{
				title: 'Home',
				url: '/',
				icon: 'fa-solid fa-house',
			},
			{
				title: 'About',
				url: '/about',
				icon: 'fa-solid fa-user',
			},
			{
				title: 'Blog',
				url: '/blog',
				icon: 'fa-solid fa-blog',
			},
			{
				title: 'Docs',
				url: '/docs',
				icon: 'fa-solid fa-file-alt',
			},
			{
				title: 'Source Code',
				url: 'https://github.com/chocoOnEstrogen/choco.rip',
				icon: 'fa-solid fa-code',
			},
		],
		footer_links: [
			{
				title: 'Blog',
				url: '/blog',
			},
			{
				title: 'About',
				url: '/about',
			},
		],
	},
	bsky: {
		username: 'choco.rip',
	},
}

export default config
