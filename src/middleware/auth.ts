import { Request, Response, NextFunction } from 'express'
import { error } from '@/utils/request'

declare global {
	namespace Express {
		interface Request {
			isAuthenticated?: boolean
		}
	}
}

export const requireAuth = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const token =
		req.headers.authorization?.split(' ')[1] || req.cookies?.adminToken
	const sessionToken = process.env.SESSION_TOKEN

	if (!sessionToken) {
		console.error('SESSION_TOKEN is not set in environment variables')
		return error(req, res, new Error('Server configuration error'), 500)
	}

	if (token === sessionToken) {
		req.isAuthenticated = true
		next()
	} else {
		error(req, res, new Error('Unauthorized'), 401)
	}
}
