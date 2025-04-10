import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the host from the request headers
  const host = request.headers.get('host') || ''
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  // Create a new response
  const response = NextResponse.next()

  // Set the X-HOST header
  response.headers.set('X-HOST', origin)

  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: '/:path*',
} 