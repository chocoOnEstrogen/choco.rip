"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { GithubUser, GithubEvent } from "@/lib/github"
import { ArrowLeft, Copy, Check, Search, Loader2 } from "lucide-react"
import Link from "next/link"

interface GithubData {
  user: {
    data: GithubUser
    isCached: boolean
    metadata: {
      fetchedAt: string
      source: string
      cacheKey: string
    }
  }
  events: {
    data: GithubEvent[]
    isCached: boolean
    metadata: {
      fetchedAt: string
      source: string
      cacheKey: string
    }
  }
}

export default function MyGithub() {
  const [username, setUsername] = useState("")
  const [user, setUser] = useState<GithubUser | null>(null)
  const [events, setEvents] = useState<GithubEvent[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dataSource, setDataSource] = useState<"cache" | "api" | null>(null)

  const handleSearch = async () => {
    if (!username.trim()) {
      setError("Please enter a GitHub username")
      return
    }

    setIsLoading(true)
    setError("")
    setUser(null)
    setEvents([])
    setDataSource(null)

    try {
      const response = await fetch(`/api/github?username=${username}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch GitHub data")
      }
      const data: GithubData = await response.json()
      setUser(data.user.data)
      setEvents(data.events.data)
      setDataSource(data.user.metadata.source as "cache" | "api")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching data")
    } finally {
      setIsLoading(false)
    }
  }

  const copyId = () => {
    if (user) {
      navigator.clipboard.writeText(user.id.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-24">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Badge
              variant="outline"
              className="w-fit rounded-full px-4 py-1 text-sm bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
            >
              GitHub Info
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Find Your GitHub ID
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Enter your GitHub username to view your profile information and get your GitHub ID.
            </p>
          </div>
        </div>

        <Card className="border-pink-100 dark:border-pink-900/30 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-8">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter your GitHub username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 text-lg"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="rounded-full px-8 py-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <div className="text-red-500 text-sm font-medium">{error}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {user && (
          <div className="space-y-8">
            <Card className="border-pink-100 dark:border-pink-900/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-8">
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="text-center sm:text-left">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-full mx-auto sm:mx-0 mb-4 shadow-lg ring-4 ring-pink-100 dark:ring-pink-900/30 overflow-hidden">
                        <img
                          src={user.avatar_url}
                          alt={`${user.login}'s avatar`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://github.com/github.png";
                          }}
                        />
                      </div>
                      <a
                        href={user.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <svg className="w-5 h-5 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        {user.name || user.login}
                      </h2>
                      <span className="text-muted-foreground text-lg">@{user.login}</span>
                      {dataSource && (
                        <Badge
                          variant="outline"
                          className={`ml-auto ${
                            dataSource === 'cache'
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {dataSource === 'cache' ? 'Cached' : 'Live'} • {new Date().toLocaleTimeString()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-lg mb-6">{user.bio || "No bio available"}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-mono font-medium">{user.id}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyId}
                          className="h-8 w-8 p-0 hover:bg-pink-100 dark:hover:bg-pink-900/20"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10">
                        <span className="text-muted-foreground">Followers:</span>
                        <span className="font-medium">{user.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10">
                        <span className="text-muted-foreground">Following:</span>
                        <span className="font-medium">{user.following.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10">
                        <span className="text-muted-foreground">Repos:</span>
                        <span className="font-medium">{user.public_repos.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10">
                        <span className="text-muted-foreground">Gists:</span>
                        <span className="font-medium">{user.public_gists.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">{formatDate(user.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {user.email && (
                        <a
                          href={`mailto:${user.email}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-700 dark:text-pink-300 hover:from-pink-200 hover:to-purple-200 dark:hover:from-pink-900/40 dark:hover:to-purple-900/40 transition-all shadow-sm hover:shadow-md"
                        >
                          ✉️ {user.email}
                        </a>
                      )}
                      {user.blog && (
                        <a
                          href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-700 dark:text-pink-300 hover:from-pink-200 hover:to-purple-200 dark:hover:from-pink-900/40 dark:hover:to-purple-900/40 transition-all shadow-sm hover:shadow-md"
                        >
                          🌐 {user.blog}
                        </a>
                      )}
                      {user.twitter_username && (
                        <a
                          href={`https://twitter.com/${user.twitter_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-700 dark:text-pink-300 hover:from-pink-200 hover:to-purple-200 dark:hover:from-pink-900/40 dark:hover:to-purple-900/40 transition-all shadow-sm hover:shadow-md"
                        >
                          🐦 @{user.twitter_username}
                        </a>
                      )}
                      {user.location && (
                        <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-700 dark:text-pink-300 shadow-sm">
                          📍 {user.location}
                        </span>
                      )}
                      {user.company && (
                        <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 text-pink-700 dark:text-pink-300 shadow-sm">
                          🏢 {user.company}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-pink-100 dark:border-pink-900/30 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.map((event) => {
                      let actionText = ""
                      let icon = "📝"
                      switch (event.type) {
                        case "PushEvent":
                          actionText = `Pushed to ${event.repo.name}`
                          icon = "⬆️"
                          break
                        case "CreateEvent":
                          actionText = `Created ${event.payload.ref_type} in ${event.repo.name}`
                          icon = "✨"
                          break
                        case "IssuesEvent":
                          actionText = `${event.payload.action} issue in ${event.repo.name}`
                          icon = "📋"
                          break
                        case "PullRequestEvent":
                          actionText = `${event.payload.action} PR in ${event.repo.name}`
                          icon = "🔀"
                          break
                        case "WatchEvent":
                          actionText = `Starred ${event.repo.name}`
                          icon = "⭐"
                          break
                        case "ForkEvent":
                          actionText = `Forked ${event.repo.name}`
                          icon = "🔱"
                          break
                        case "ReleaseEvent":
                          actionText = `Released ${event.payload.release.tag_name} in ${event.repo.name}`
                          icon = "📦"
                          break
                        case "CommitCommentEvent":
                          actionText = `Commented on commit in ${event.repo.name}`
                          icon = "💬"
                          break
                        case "IssueCommentEvent":
                          actionText = `Commented on issue in ${event.repo.name}`
                          icon = "💬"
                          break
                        case "PullRequestReviewEvent":
                          actionText = `Reviewed PR in ${event.repo.name}`
                          icon = "👀"
                          break
                        case "MemberEvent":
                          actionText = `${event.payload.action} ${event.payload.member.login} to ${event.repo.name}`
                          icon = "👥"
                          break
                        case "PublicEvent":
                          actionText = `Made ${event.repo.name} public`
                          icon = "🌐"
                          break
                        case "DeleteEvent":
                          actionText = `Deleted ${event.payload.ref_type} in ${event.repo.name}`
                          icon = "🗑️"
                          break
                        case "GollumEvent":
                          actionText = `${event.payload.pages[0].action} wiki page in ${event.repo.name}`
                          icon = "📚"
                          break
                        case "PullRequestReviewCommentEvent":
                          actionText = `Commented on PR review in ${event.repo.name}`
                          icon = "💬"
                          break
                        case "PullRequestReviewThreadEvent":
                          actionText = `${event.payload.action} PR review thread in ${event.repo.name}`
                          icon = "🧵"
                          break
                        case "SponsorshipEvent":
                          actionText = `${event.payload.action} sponsorship for ${event.payload.sponsorship.sponsor.login}`
                          icon = "💖"
                          break
                        case "DeploymentEvent":
                          actionText = `Deployed to ${event.payload.deployment.environment} in ${event.repo.name}`
                          icon = "🚀"
                          break
                        case "DeploymentStatusEvent":
                          actionText = `Deployment status: ${event.payload.deployment_status.state} in ${event.repo.name}`
                          icon = "📊"
                          break
                        case "RepositoryEvent":
                          actionText = `${event.payload.action} repository ${event.repo.name}`
                          icon = "🏗️"
                          break
                        case "RepositoryVulnerabilityAlertEvent":
                          actionText = `${event.payload.action} vulnerability alert in ${event.repo.name}`
                          icon = "⚠️"
                          break
                        case "SecurityAdvisoryEvent":
                          actionText = `${event.payload.action} security advisory in ${event.repo.name}`
                          icon = "🔒"
                          break
                        case "TeamEvent":
                          actionText = `${event.payload.action} team in ${event.repo.name}`
                          icon = "👥"
                          break
                        case "TeamAddEvent":
                          actionText = `Added to team ${event.payload.team.name} in ${event.repo.name}`
                          icon = "➕"
                          break
                        case "StatusEvent":
                          actionText = `Updated status in ${event.repo.name}`
                          icon = "📊"
                          break
                        case "CheckRunEvent":
                          actionText = `${event.payload.action} check run in ${event.repo.name}`
                          icon = "✅"
                          break
                        case "CheckSuiteEvent":
                          actionText = `${event.payload.action} check suite in ${event.repo.name}`
                          icon = "📋"
                          break
                        case "CodeScanningAlertEvent":
                          actionText = `${event.payload.action} code scanning alert in ${event.repo.name}`
                          icon = "🔍"
                          break
                        case "DependabotAlertEvent":
                          actionText = `${event.payload.action} Dependabot alert in ${event.repo.name}`
                          icon = "📦"
                          break
                        case "DiscussionEvent":
                          actionText = `${event.payload.action} discussion in ${event.repo.name}`
                          icon = "💬"
                          break
                        case "DiscussionCommentEvent":
                          actionText = `${event.payload.action} discussion comment in ${event.repo.name}`
                          icon = "💬"
                          break
                        case "EnvironmentEvent":
                          actionText = `${event.payload.action} environment in ${event.repo.name}`
                          icon = "🌍"
                          break
                        case "LabelEvent":
                          actionText = `${event.payload.action} label in ${event.repo.name}`
                          icon = "🏷️"
                          break
                        case "MilestoneEvent":
                          actionText = `${event.payload.action} milestone in ${event.repo.name}`
                          icon = "🎯"
                          break
                        case "ProjectEvent":
                          actionText = `${event.payload.action} project in ${event.repo.name}`
                          icon = "📋"
                          break
                        case "ProjectCardEvent":
                          actionText = `${event.payload.action} project card in ${event.repo.name}`
                          icon = "📝"
                          break
                        case "ProjectColumnEvent":
                          actionText = `${event.payload.action} project column in ${event.repo.name}`
                          icon = "📊"
                          break
                        case "RegistryPackageEvent":
                          actionText = `${event.payload.action} package in ${event.repo.name}`
                          icon = "📦"
                          break
                        case "RepositoryImportEvent":
                          actionText = `${event.payload.action} repository import in ${event.repo.name}`
                          icon = "📥"
                          break
                        case "RepositoryVulnerabilityAlertCreateEvent":
                          actionText = `Created vulnerability alert in ${event.repo.name}`
                          icon = "⚠️"
                          break
                        case "RepositoryVulnerabilityAlertDismissEvent":
                          actionText = `Dismissed vulnerability alert in ${event.repo.name}`
                          icon = "✅"
                          break
                        case "RepositoryVulnerabilityAlertReopenEvent":
                          actionText = `Reopened vulnerability alert in ${event.repo.name}`
                          icon = "🔄"
                          break
                        case "RepositoryVulnerabilityAlertResolveEvent":
                          actionText = `Resolved vulnerability alert in ${event.repo.name}`
                          icon = "✅"
                          break
                        case "WorkflowDispatchEvent":
                          actionText = `Manually triggered workflow in ${event.repo.name}`
                          icon = "⚡"
                          break
                        case "WorkflowJobEvent":
                          actionText = `${event.payload.action} workflow job in ${event.repo.name}`
                          icon = "⚙️"
                          break
                        case "WorkflowRunEvent":
                          actionText = `${event.payload.action} workflow run in ${event.repo.name}`
                          icon = "⚙️"
                          break
                        default:
                          actionText = `${event.type} in ${event.repo.name}`
                          icon = "📝"
                      }
                      return (
                        <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <span>{icon}</span>
                            <span className="text-muted-foreground font-medium">{actionText}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{formatDate(event.created_at)}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-100 dark:border-pink-900/30 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <a
                      href={`https://github.com/${user.login}?tab=repositories`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>📚</span>
                        <span className="text-muted-foreground font-medium">View Repositories</span>
                      </div>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </a>
                    <a
                      href={`https://github.com/${user.login}?tab=stars`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>⭐</span>
                        <span className="text-muted-foreground font-medium">View Stars</span>
                      </div>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </a>
                    <a
                      href={`https://github.com/${user.login}?tab=followers`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span className="text-muted-foreground font-medium">View Followers</span>
                      </div>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </a>
                    <a
                      href={`https://github.com/${user.login}?tab=following`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span className="text-muted-foreground font-medium">View Following</span>
                      </div>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
