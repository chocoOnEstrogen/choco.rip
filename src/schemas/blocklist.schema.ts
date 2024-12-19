import mongoose from 'mongoose'

export interface IBlocklist extends mongoose.Document {
	type: 'ip' | 'country'
	value: string
	reason?: string
	createdAt: Date
	expiresAt?: Date
}

const BlocklistSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: true,
			enum: ['ip', 'country'],
		},
		value: {
			type: String,
			required: true,
			trim: true,
		},
		reason: {
			type: String,
			trim: true,
		},
		expiresAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
)

// Create indexes for frequently queried fields
BlocklistSchema.index({ type: 1, value: 1 }, { unique: true })
BlocklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model<IBlocklist>('Blocklist', BlocklistSchema)
