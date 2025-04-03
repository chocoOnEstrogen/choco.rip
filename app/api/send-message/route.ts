import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { buildEmbed } from '@/lib/discord';
import { env } from '@/env.mjs';
import { cookies } from 'next/headers';

function makeID() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // 3 requests per minute
const COOKIE_NAME = 'contact_form_session';

type RequestData = {
  sessionId: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(COOKIE_NAME)?.value;

    // If no session exists, create one
    if (!sessionId) {
      sessionId = makeID();
      // Set cookie with 1 hour expiry
      cookieStore.set(COOKIE_NAME, sessionId, {
        maxAge: 3600,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }

    const rateLimitKey = `rate_limit:${sessionId}`;
    const requestId = makeID();
    const requestKey = `request:${requestId}`;

    // Check rate limit
    const currentRequests = await redis.get<number>(rateLimitKey) || 0;
    if (currentRequests >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store request details in Redis
    await redis.set(requestKey, {
      sessionId,
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
      status: 'pending'
    }, 3600); // Store for 1 hour

    // Increment rate limit counter
    await redis.set(rateLimitKey, currentRequests + 1, RATE_LIMIT_WINDOW);

    // Create Discord embed
    const embed = buildEmbed({
      title: 'New Contact Form Submission',
      color: 0xFF69B4, // Pink color
      fields: [
        {
          name: 'Name',
          value: name,
          inline: true,
        },
        {
          name: 'Email',
          value: email,
          inline: true,
        },
        {
          name: 'Message',
          value: message,
        },
        {
          name: 'Request ID',
          value: requestId,
          inline: true,
        },
        {
          name: 'Session ID',
          value: sessionId,
          inline: true,
        }
      ],
      timestamp: new Date(),
    });

    // Send to Discord webhook
    const response = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      // Update request status to failed
      await redis.set(requestKey, {
        ...(await redis.get<RequestData>(requestKey) || {}),
        status: 'failed',
        error: 'Discord webhook failed'
      });
      throw new Error('Failed to send message to Discord');
    }

    // Update request status to success
    await redis.set(requestKey, {
      ...(await redis.get<RequestData>(requestKey) || {}),
      status: 'success'
    });

    return NextResponse.json({ 
      success: true,
      requestId,
      sessionId
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}