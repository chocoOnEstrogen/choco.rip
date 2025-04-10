import { NextResponse } from 'next/server'
import sharp, { FormatEnum } from 'sharp'
import axios from 'axios'
import { redis } from '@/lib/redis'

interface DiscordActivity {
    name: string;
    type: number;
    state?: string;
    details?: string;
    timestamps?: {
        start?: number;
        end?: number;
    };
    assets?: {
        large_image?: string;
        large_text?: string;
        small_image?: string;
        small_text?: string;
    };
}

interface DiscordUser {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
    discriminator: string;
}

interface SpotifyActivity {
    timestamps: {
        start: number;
        end: number;
    };
    album: string;
    album_art_url: string;
    artist: string;
    song: string;
    track_id: string;
}

interface LanyardData {
    success: boolean;
    data: {
        discord_user: DiscordUser;
        discord_status: string;
        activities: DiscordActivity[];
    } | null;
}

// Cache TTL in seconds (5 minutes)
const CACHE_TTL = 300

async function fetchLanyardData(userId: string) {
    try {
        const response = await axios.get(`https://api.lanyard.rest/v1/users/${userId}`)
        return response.data
    } catch (error) {
        console.error('Error fetching Lanyard data:', error)
        return { success: false, data: null }
    }
}

async function convertGifToWebp(gifUrl: string): Promise<string> {
    try {
        const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        const webpBuffer = await sharp(buffer)
            .webp()
            .toBuffer();
        return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
    } catch (error) {
        console.error('Error converting GIF to WebP:', error);
        return gifUrl; // Return original URL if conversion fails
    }
}

async function downloadImage(url: string, type: string = 'png'): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const sharpBuffer = await sharp(buffer)
        .toFormat(type as any)
        .toBuffer();
    return `data:image/${type};base64,${sharpBuffer.toString('base64')}`;
}

const ShortCard = async (avatar: string, username: string, displayName: string, status: string) => {
    // Encode the avatar URL to handle special characters
    let encodedAvatar = encodeURI(avatar);
    
    // Always convert image to base64 to avoid CORS issues
    try {
        const webpUrl = await convertGifToWebp(encodedAvatar);
        encodedAvatar = webpUrl;
    } catch (error) {
        console.error('Error converting avatar to base64:', error);
        // Fallback to default avatar if conversion fails
        encodedAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }
    
    // Determine status color based on Discord status
    let statusColor = '#b9bbbe'; // Default gray
    switch (status) {
        case 'online':
            statusColor = '#43b581'; // Green
            break;
        case 'idle':
            statusColor = '#faa61a'; // Yellow
            break;
        case 'dnd':
            statusColor = '#f04747'; // Red
            break;
        case 'offline':
            statusColor = '#747f8d'; // Gray
            break;
    }
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="340" height="120" viewBox="0 0 340 120" xmlns="http://www.w3.org/2000/svg">
    <!-- Background Card -->
    <rect x="0" y="0" width="340" height="120" rx="10" fill="#292b2f"/>
    
    <!-- Avatar Circle and Status -->
    <defs>
        <!-- Avatar Clip Path -->
        <clipPath id="avatarClip">
            <circle cx="50" cy="50" r="35"/>
        </clipPath>
    </defs>
    
    <!-- Avatar Background -->
    <circle cx="50" cy="50" r="35" fill="#36393f"/>
    
    <!-- Avatar -->
    <foreignObject x="15" y="15" width="70" height="70">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden;">
            <img src="${encodedAvatar}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
    </foreignObject>
    
    <!-- Status Indicator -->
    <circle cx="75" cy="75" r="12" fill="#292b2f"/>
    <circle cx="75" cy="75" r="8" fill="${statusColor}"/>
    
    <!-- Display Name -->
    <text x="100" y="45" font-family="Arial" font-size="20" font-weight="600" fill="white">${displayName}</text>
    
    <!-- Username -->
    <text x="100" y="70" font-family="Arial" font-size="14" fill="#b9bbbe">${username}</text>
</svg> `
}

const NormalCard = async (
    avatar: string, 
    username: string, 
    displayName: string, 
    status: string, 
    activities: DiscordActivity[] = [],
    spotifyActivity: SpotifyActivity | null = null
) => {
    // Encode the avatar URL to handle special characters
    let encodedAvatar = encodeURI(avatar);
    
    // Always convert image to base64 to avoid CORS issues
    try {
        const webpUrl = await convertGifToWebp(encodedAvatar);
        encodedAvatar = webpUrl;
    } catch (error) {
        console.error('Error converting avatar to base64:', error);
        encodedAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }
    
    // Determine status color based on Discord status
    let statusColor = '#b9bbbe'; // Default gray
    switch (status) {
        case 'online':
            statusColor = '#43b581';
            break;
        case 'idle':
            statusColor = '#faa61a';
            break;
        case 'dnd':
            statusColor = '#f04747';
            break;
        case 'offline':
            statusColor = '#747f8d';
            break;
    }


    // Extract Spotify data if available
    const spotifyData = spotifyActivity ? {
        timestamps: spotifyActivity.timestamps,
        album: spotifyActivity.album || '',
        album_art_url: await downloadImage(spotifyActivity.album_art_url || '', 'png'),
        artist: spotifyActivity.artist || '',
        song: spotifyActivity.song || '',
        track_id: spotifyActivity.track_id || ''
    } : null;

    // Calculate progress percentage if timestamps are available
    let progressPercentage = 0;
    let durationText = '';
    
    if (spotifyData && spotifyData.timestamps) {
        const { start, end } = spotifyData.timestamps;
        const now = Date.now();
        
        if (start && end) {
            const totalDuration = end - start;
            const elapsed = now - start;
            progressPercentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
            
            // Format duration text (e.g., "2:30 / 3:45")
            const formatTime = (ms: number) => {
                const totalSeconds = Math.floor(ms / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            };
            
            durationText = `${formatTime(elapsed)} / ${formatTime(totalDuration)}`;
        }
    }

    // Create the SVG content
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Background Card -->
    <rect x="0" y="0" width="600" height="400" rx="10" fill="#18191c"/>
    
    <!-- Banner Section -->
    <rect x="0" y="0" width="600" height="120" rx="10" fill="#36393f"/>
    
    <!-- Avatar Section -->
    <defs>
        <clipPath id="avatarClip">
            <circle cx="80" cy="100" r="50"/>
        </clipPath>
    </defs>
    
    <!-- Avatar Background -->
    <circle cx="80" cy="100" r="50" fill="#18191c" stroke="#18191c" stroke-width="6"/>
    
    <!-- Avatar -->
    <foreignObject x="30" y="50" width="100" height="100">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden;">
            <img src="${encodedAvatar}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
    </foreignObject>
    
    <!-- Status Indicator -->
    <circle cx="115" cy="135" r="18" fill="#18191c"/>
    <circle cx="115" cy="135" r="13" fill="${statusColor}"/>
    
    <!-- User Info -->
    <text x="40" y="190" font-family="gg sans, Arial" font-size="28" font-weight="700" fill="#ffffff">${displayName}</text>
    <text x="40" y="220" font-family="gg sans, Arial" font-size="20" fill="#b9bbbe">${username}</text>

    <!-- Divider -->
    <line x1="40" y1="240" x2="560" y2="240" stroke="#2f3136" stroke-width="2"/>

    ${spotifyActivity && spotifyData ? `
    <!-- Spotify Section -->
    <rect x="40" y="260" width="520" height="120" rx="8" fill="#1DB954" opacity="0.9"/>
    
    <!-- Spotify Icon -->
    <circle cx="60" cy="320" r="15" fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
    <text x="60" y="325" font-family="Arial" font-size="20" font-weight="bold" fill="#1DB954" text-anchor="middle">S</text>
    
    <!-- Spotify Text -->
    <text x="60" y="285" font-family="gg sans, Arial" font-size="14" fill="white" opacity="0.9">LISTENING TO SPOTIFY</text>
    
    <!-- Album Art -->
    <foreignObject x="40" y="300" width="60" height="60">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
            <img src="${spotifyData.album_art_url}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
    </foreignObject>
    
    <!-- Song Info -->
    <text x="110" y="320" font-family="gg sans, Arial" font-size="16" font-weight="600" fill="white" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))">${spotifyData.song}</text>
    <text x="110" y="340" font-family="gg sans, Arial" font-size="14" fill="white" opacity="0.9">${spotifyData.artist}</text>
    <text x="110" y="360" font-family="gg sans, Arial" font-size="12" fill="white" opacity="0.8">${spotifyData.album}</text>
    
    <!-- Progress Bar -->
    <rect x="400" y="320" width="140" height="4" rx="2" fill="rgba(255, 255, 255, 0.2)"/>
    <rect x="400" y="320" width="${140 * (progressPercentage / 100)}" height="4" rx="2" fill="white" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"/>
    
    <!-- Duration Text -->
    <text x="400" y="350" font-family="gg sans, Arial" font-size="10" fill="white" opacity="0.8">${durationText}</text>
    ` : ''}
</svg>`;

    return svgContent;
}

const ErrorCard = (errorMessage: string) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="340" height="120" viewBox="0 0 340 120" xmlns="http://www.w3.org/2000/svg">
    <!-- Background Card -->
    <rect x="0" y="0" width="340" height="120" rx="10" fill="#292b2f"/>
    
    <!-- Error Icon -->
    <circle cx="50" cy="50" r="35" fill="#36393f"/>
    <text x="50" y="65" font-family="Arial" font-size="40" font-weight="bold" fill="#f04747" text-anchor="middle">!</text>
    
    <!-- Error Message -->
    <text x="100" y="45" font-family="Arial" font-size="20" font-weight="600" fill="white">Error</text>
    <text x="100" y="70" font-family="Arial" font-size="14" fill="#b9bbbe">${errorMessage}</text>
</svg>`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Get user ID parameter
  const userId = searchParams.get('id')
  const redirect = searchParams.get('redirect')
  
  if (!userId) {
    return new NextResponse(ErrorCard('User ID is required'), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }

  if (redirect) {
    return NextResponse.redirect(`https://discord.com/users/${userId}`)
  }

  const type = searchParams.get('type') || 'short'

  try {
    // Check if the card is already in Redis cache
    const cacheKey = `discord-profile:${userId}:${type}`
    const cachedCard = await redis.get<string>(cacheKey)
    
    if (cachedCard) {
      console.log(`Serving cached Discord profile card for user ${userId}`)
      return new NextResponse(cachedCard, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': `public, max-age=${CACHE_TTL}, immutable`,
        },
      })
    }
    
    // Fetch user data from Lanyard APIs
    const lanyardData = await fetchLanyardData(userId)
    
    if (!lanyardData.success) {
      return new NextResponse(ErrorCard('Failed to fetch user data'), {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    }
    
    const { discord_user, discord_status, activities, spotify } = lanyardData.data
    
    // Construct avatar URL
    const avatarId = discord_user.avatar
    const avatarUrl = avatarId 
      ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${avatarId}.${avatarId.startsWith('a_') ? 'gif' : 'png'}`
      : `https://cdn.discordapp.com/embed/avatars/0.png`
    
    // Generate SVG card
    let svg;


    switch (type) {
      case 'short':
        svg = await ShortCard(
          avatarUrl, 
          discord_user.username, 
          discord_user.global_name,
          discord_status
        )
        break;
      case 'normal':
        console.log("Generating normal card")
        svg = await NormalCard(
          avatarUrl, 
          discord_user.username,
          discord_user.global_name,
          discord_status,
          activities,
          spotify
        )
        break;
      default:
        svg = ErrorCard('Invalid card type')
        break;
    }
    

    // Store the generated card in Redis cache
    try {
      await redis.set(cacheKey, svg, CACHE_TTL)
      console.log(`Cached Discord profile card for user ${userId}`)
    } catch (redisError) {
      console.error('Redis caching error:', redisError)
      // Continue even if caching fails
    }

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': `public, max-age=${CACHE_TTL}, immutable`
      },
    })
  } catch (error) {
    console.error('Error generating profile card:', error)
    return new NextResponse(ErrorCard('Failed to generate profile card'), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }
}