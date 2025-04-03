import { Metadata } from "next"
import { getGithubRepos } from "@/lib/github"
import { makeRepoSVG, formatDate } from "@/lib/utils"
import config from "@/config"
import ProjectCard from "@/components/project-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Open Source Projects",
  icons: {
    icon: config.avatar,
    shortcut: config.avatar,
    apple: config.avatar,
  },
  description: `Explore ${config.name}'s collection of open source projects and contributions. From web development to developer tools, discover innovative solutions and impactful code.`,
  openGraph: {
    title: "Open Source Projects",
    description: `Explore ${config.name}'s collection of open source projects and contributions. From web development to developer tools, discover innovative solutions and impactful code.`,
    type: "website",
    url: config.url + "/projects",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Source Projects",
    description: `Explore ${config.name}'s collection of open source projects and contributions. From web development to developer tools, discover innovative solutions and impactful code.`,
  },
  alternates: {
    canonical: config.url + "/projects",
  },
}

export default async function ProjectsPage() {
  const { repos } = await getGithubRepos("chocoOnEstrogen")

  const projects = repos.map(repo => ({
    id: repo.id,
    title: repo.name,
    description: repo.description || "No description available",
    image: makeRepoSVG(
      repo.name,
      repo.description || "No description available",
      repo.stargazers_count || 0,
      repo.forks_count || 0,
      repo.open_issues_count || 0,
      formatDate(repo.updated_at),
      repo.license?.name || "No License"
    ),
    tags: repo.topics,
    category: "web",
    github_url: repo.html_url,
    demo_url: repo.homepage,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    issues: repo.open_issues_count,
    updated_at: repo.updated_at,
    html_url: repo.html_url,
    created_at: repo.created_at,
  }))

  return (
    <div className="container px-4 md:px-6 py-20 md:py-32">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Badge
              variant="outline"
              className="w-fit rounded-full px-4 py-1 text-sm bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
            >
              <Heart className="h-3.5 w-3.5 mr-1 text-pink-500" />
              <span>My Projects</span>
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Open Source Projects</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              A collection of my open source contributions and personal projects. Each project is crafted with attention to detail and a focus on developer experience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link href={config.github} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="rounded-full px-6 border-pink-200 dark:border-pink-800">
              <span>View All Projects on GitHub</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}