import { Document } from 'mongoose'

export interface ILink extends Document {
	type: string
	url: string
	icon: string
	title: string
	description: string
	priority: number
	active: boolean
	createdAt: Date
	updatedAt: Date
}
