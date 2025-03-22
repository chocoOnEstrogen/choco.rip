import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string().min(1, "Title is required"),
		excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(200, "Excerpt must be less than 200 characters"),
		image: z.string().url("Image must be a valid URL").optional(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		draft: z.boolean().default(false),
		featured: z.boolean().default(false),
		author: z.string().default("Selina"),
		categories: z.array(z.string()).min(1, "At least one category is required"),
		tags: z.array(z.string()).default([]),
	})
})


const miscCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string().min(1, "Title is required"),
	})
})

const bskyListsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string().min(1, "Title is required"),
		description: z.string().min(1, "Description is required"),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		items: z.array(z.object({
			name: z.string().min(1, "Name is required"),
			url: z.string().url("URL must be a valid URL"),
			description: z.string().min(1, "Description is required"),
		})),
		url: z.string().url("URL must be a valid URL"),
	})
})

export const collections = {
	blog: blogCollection,
	misc: miscCollection,
	bskyLists: bskyListsCollection
};