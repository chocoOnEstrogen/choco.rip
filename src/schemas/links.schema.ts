import mongoose from 'mongoose'
import { ILink } from '@/interfaces/ILink'

const LinkSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: true,
			trim: true,
			enum: ['social', 'other'],
		},
		url: {
			type: String,
			required: true,
			trim: true,
			validate: {
				validator: (value: string) => {
					try {
						new URL(value)
						return true
					} catch (error) {
						return false
					}
				},
				message: 'Invalid URL format',
			},
		},
		icon: {
			type: String,
			required: true,
			trim: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
			minlength: [2, 'Title must be at least 2 characters long'],
			maxlength: [100, 'Title cannot exceed 100 characters'],
		},
		description: {
			type: String,
			trim: true,
			maxlength: [200, 'Description cannot exceed 200 characters'],
		},
		priority: {
			type: Number,
			default: 0,
		},
		active: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
)

// Create indexes for frequently queried fields
LinkSchema.index({ type: 1 })
LinkSchema.index({ createdAt: -1 })

export default mongoose.model<ILink>('Link', LinkSchema)
