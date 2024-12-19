import { Request, Response, NextFunction } from 'express'
import geoip from 'geoip-lite'
import BlocklistModel from '@/schemas/blocklist.schema'
import { error } from '@/utils/request'

export const checkBlocklist = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const ip = req.ip || req.socket.remoteAddress || ''

		// Check if IP is blocked
		const blockedIP = await BlocklistModel.findOne({
			type: 'ip',
			value: ip,
			$or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
		})

		if (blockedIP) {
			return error(req, res, new Error('Access denied'), 403)
		}

		// Check if country is blocked
		const geo = geoip.lookup(ip)
		if (geo?.country) {
			const blockedCountry = await BlocklistModel.findOne({
				type: 'country',
				value: geo.country,
				$or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
			})

			if (blockedCountry) {
				return error(
					req,
					res,
					new Error(`${blockedCountry.reason || `Your country is blocked`}`),
					403,
				)
			}
		}

		next()
	} catch (err) {
		console.error('Blocklist check error:', err)
		next()
	}
}
