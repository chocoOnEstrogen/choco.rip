import { NextRequest, NextResponse } from "next/server"
import { getGithubUser, getUserEvents } from "@/lib/github"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    )
  }

  try {
    const [user, events] = await Promise.all([
      getGithubUser(username),
      getUserEvents(username),
    ])

    return NextResponse.json({
      user,
      events,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching GitHub data:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("404")) {
        return NextResponse.json(
          { error: "GitHub user not found" },
          { status: 404 }
        )
      }
      if (error.message.includes("403")) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded" },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    )
  }
} 