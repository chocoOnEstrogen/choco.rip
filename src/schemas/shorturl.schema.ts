import mongoose from 'mongoose'

// Click event schema for detailed analytics
const ClickEventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
  referer: String,
  country: String,
  city: String,
  device: String,
  browser: String,
  os: String,
})

// Main short URL schema
const ShortURLSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  expiresAt: {
    type: Date,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  clickEvents: [ClickEventSchema],
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Indexes for better query performance
ShortURLSchema.index({ shortCode: 1 })
ShortURLSchema.index({ expiresAt: 1 })

export default mongoose.model('ShortURL', ShortURLSchema) 