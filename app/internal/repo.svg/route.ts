import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') || 'Repository Name'
  const description = searchParams.get('description') || 'A brief description of the repository goes here'
  const stars = searchParams.get('stars') || '1.2k'
  const forks = searchParams.get('forks') || '45'
  const issues = searchParams.get('issues') || '12'
  const updated = searchParams.get('updated') || '2 days ago'
  const license = searchParams.get('license') || 'MIT'

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Modern gradient background -->
    <defs>
      <linearGradient id="bgGradient" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FDF2F8"/>
        <stop offset="50%" stop-color="#FCE7F3"/>
        <stop offset="100%" stop-color="#FDF2F8"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bgGradient)"/>
    
    <!-- Decorative elements -->
    <circle cx="100" cy="100" r="200" fill="#FCE7F3" opacity="0.3"/>
    <circle cx="1100" cy="530" r="250" fill="#FCE7F3" opacity="0.3"/>
    
    <!-- Header section -->
    <g transform="translate(60, 80)">
      <text font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="bold" fill="#831843" letter-spacing="-0.02em">
        ${name}
      </text>
      <text y="80" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="#9D174D" opacity="0.9" max-width="1000">
        ${description}
      </text>
    </g>
    
    <!-- Stats section -->
    <g transform="translate(60, 280)">
      <!-- Stars -->
      <g>
        <rect width="280" height="140" rx="24" fill="white" stroke="#FBCFE8" stroke-width="2" filter="url(#glow)"/>
        <text x="40" y="60" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#831843">⭐ Stars</text>
        <text x="40" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="bold" fill="#831843">${stars}</text>
      </g>
      
      <!-- Forks -->
      <g transform="translate(320, 0)">
        <rect width="280" height="140" rx="24" fill="white" stroke="#FBCFE8" stroke-width="2" filter="url(#glow)"/>
        <text x="40" y="60" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#831843">🔱 Forks</text>
        <text x="40" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="bold" fill="#831843">${forks}</text>
      </g>
      
      <!-- Issues -->
      <g transform="translate(640, 0)">
        <rect width="280" height="140" rx="24" fill="white" stroke="#FBCFE8" stroke-width="2" filter="url(#glow)"/>
        <text x="40" y="60" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#831843">⚠️ Issues</text>
        <text x="40" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="bold" fill="#831843">${issues}</text>
      </g>
    </g>
    
    <!-- Footer section -->
    <g transform="translate(60, 520)">
      <rect width="1080" height="80" rx="16" fill="white" opacity="0.8" filter="url(#glow)"/>
      <text x="40" y="50" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#831843">Last updated: ${updated}</text>
      <text x="600" y="50" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#831843">License: ${license}</text>
    </g>
  </svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}