/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// Add custom colors with their full range
				purple: {
					400: '#C084FC',
					500: '#A855F7',
				},
				pink: {
					300: '#F9A8D4',
					400: '#F472B6',
					500: '#EC4899',
				},
				indigo: {
					400: '#818CF8',
					500: '#6366F1',
				},
				emerald: {
					400: '#34D399',
					500: '#10B981',
				},
				blue: {
					400: '#60A5FA',
					500: '#3B82F6',
				},
				red: {
					400: '#F87171',
					500: '#EF4444',
				},
				yellow: {
					400: '#FACC15',
					500: '#EAB308',
				},
			},
		},
	},
	plugins: [],
	// Enable arbitrary color values with opacity modifiers
	safelist: [
		{
			pattern: /(bg|text|border)-(purple|pink|indigo|emerald|blue|red|yellow)-(400|500)/,
			variants: ['hover'],
		},
	],
}
