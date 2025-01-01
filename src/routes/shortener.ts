import { Router, Request, Response } from 'express'
import { requireAuth } from '@/middleware/auth'
import ShortURL from '@/schemas/shorturl.schema'
import { nanoid } from 'nanoid'
import { UAParser } from 'ua-parser-js'
import geoip from 'geoip-lite'
import { CronService } from '@/services/cron'

const router = Router()

// Helper function to generate a unique shortcode
async function generateUniqueCode(baseCode: string): Promise<string> {
  let code = baseCode
  let exists = await ShortURL.findOne({ shortCode: code })
  let attempts = 0

  // If code exists, append random numbers until we find a unique one
  while (exists && attempts < 10) {
    code = `${baseCode}${Math.floor(Math.random() * 1000)}`
    exists = await ShortURL.findOne({ shortCode: code })
    attempts++
  }

  // If we still couldn't find a unique code, use nanoid
  if (exists) {
    code = nanoid(8)
  }

  return code
}

// Create short URL
//@ts-ignore
router.post('/api/urls', requireAuth, async (req: Request, res: Response) => {
  try {
    const { url, title, expiresIn, customCode } = req.body
    
    // Validate URL
    try {
      new URL(url)
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL' })
    }

    // Generate or validate custom shortcode
    let shortCode: string
    if (customCode) {
      // Validate custom code format (alphanumeric only)
      if (!/^[a-zA-Z0-9-_]+$/.test(customCode)) {
        return res.status(400).json({ 
          error: 'Custom code can only contain letters, numbers, hyphens, and underscores' 
        })
      }

      // Check length
      if (customCode.length < 3 || customCode.length > 50) {
        return res.status(400).json({ 
          error: 'Custom code must be between 3 and 50 characters' 
        })
      }

      // Generate unique code based on custom code
      shortCode = await generateUniqueCode(customCode)
    } else {
      // Use nanoid if no custom code provided
      shortCode = nanoid(8)
    }
    
    // Calculate expiration if provided (in hours)
    const expiresAt = expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 60 * 60 * 1000) : undefined

    const shortUrl = new ShortURL({
      originalUrl: url,
      shortCode,
      title: title?.trim(),
      createdBy: req.cookies.adminToken,
      expiresAt,
    })

    await shortUrl.save()
    
    res.json({
      shortCode,
      url: `${req.protocol}://${req.get('host')}/s/${shortCode}`,
      customCode: customCode ? shortCode === customCode : false
    })
  } catch (err) {
    console.error('Error creating short URL:', err)
    res.status(500).json({ error: 'Error creating short URL' })
  }
})

// Helper function to check if IP is local
function isLocalIP(ip: string): boolean {
  return ip === '127.0.0.1' || 
         ip === '::1' || 
         ip.startsWith('192.168.') || 
         ip.startsWith('10.') || 
         ip.startsWith('172.16.') ||
         ip.includes('::ffff:') // IPv4-mapped IPv6 addresses
}

// Redirect and track
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params
    const shortUrl = await ShortURL.findOne({ shortCode: code, active: true })

    if (!shortUrl) {
      return res.status(404).render('404')
    }

    // Check expiration
    if (shortUrl.expiresAt && shortUrl.expiresAt < new Date()) {
      return res.status(410).render('error', { 
        message: 'This link has expired'
      })
    }

    // Parse user agent
    const ua = new UAParser(req.headers['user-agent'])
    const browser = ua.getBrowser()
    const os = ua.getOS()
    const device = ua.getDevice()

    // Get IP and check if it's local or IPv6
    const ip = req.ip
    const clickEvent: any = {
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
      device: device.type || 'desktop',
      browser: browser.name,
      os: os.name,
    }

    // Only add IP and location if it's not local and not IPv6
    if (ip && !isLocalIP(ip)) {
      const geo = geoip.lookup(ip)
      if (geo) {
        clickEvent.ip = ip
        clickEvent.country = geo.country
        clickEvent.city = geo.city
      }
    }

    // Update in database
    await ShortURL.findByIdAndUpdate(shortUrl._id, {
      $inc: { clicks: 1 },
      $push: { clickEvents: clickEvent }
    })

    res.redirect(shortUrl.originalUrl)
  } catch (err) {
    console.error('Error redirecting:', err)
    res.status(500).render('error')
  }
})

// Get URL analytics
//@ts-ignore
router.get('/api/urls/:code/analytics', requireAuth, async (req: Request, res: Response) => {
  try {
    const { code } = req.params
    const shortUrl = await ShortURL.findOne({ shortCode: code })

    if (!shortUrl) {
      return res.status(404).json({ error: 'URL not found' })
    }

    // Define interfaces for analytics objects
    interface AnalyticsCount {
      [key: string]: number;
    }

    interface Analytics {
      totalClicks: number;
      clicksByCountry: AnalyticsCount;
      clicksByBrowser: AnalyticsCount;
      clicksByOS: AnalyticsCount;
      clicksByDevice: AnalyticsCount;
      clicksByHour: AnalyticsCount;
      recentClicks: any[]; // Or define a proper interface for click events
    }

    // Initialize analytics with type
    const analytics: Analytics = {
      totalClicks: shortUrl.clicks,
      clicksByCountry: {},
      clicksByBrowser: {},
      clicksByOS: {},
      clicksByDevice: {},
      clicksByHour: {},
      recentClicks: shortUrl.clickEvents.slice(-10),
    }

    // Process click events
    shortUrl.clickEvents.forEach(event => {
      // Count by country
      analytics.clicksByCountry[event.country || ''] = (analytics.clicksByCountry[event.country || ''] || 0) + 1
      
      // Count by browser
      analytics.clicksByBrowser[event.browser || ''] = (analytics.clicksByBrowser[event.browser || ''] || 0) + 1
      
      // Count by OS
      analytics.clicksByOS[event.os || ''] = (analytics.clicksByOS[event.os || ''] || 0) + 1
      
      // Count by device
      analytics.clicksByDevice[event.device || ''] = (analytics.clicksByDevice[event.device || ''] || 0) + 1
      
      // Count by hour
      const hour = new Date(event.timestamp).getHours()
      analytics.clicksByHour[hour] = (analytics.clicksByHour[hour] || 0) + 1
    })

    res.json(analytics)
  } catch (err) {
    console.error('Error getting analytics:', err)
    res.status(500).json({ error: 'Error getting analytics' })
  }
})

// Delete URL
//@ts-ignore
router.delete('/api/urls/:code', requireAuth, async (req: Request, res: Response) => {
  const { code } = req.params
  await ShortURL.findOneAndDelete({ shortCode: code })
  res.status(204).send()
})

// Register cleanup cron job
const cronService = CronService.getInstance()
cronService.registerJob({
  name: 'cleanup-expired-urls',
  schedule: '0 * * * *', // Run every hour
  task: async () => {
    try {
      const result = await ShortURL.deleteMany({
        expiresAt: { $lt: new Date() }
      })
      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} expired URLs`)
      }
    } catch (error) {
      console.error('Error cleaning up expired URLs:', error)
    }
  },
  onError: (error) => {
    console.error('Error in URL cleanup job:', error)
  }
})

export default router 