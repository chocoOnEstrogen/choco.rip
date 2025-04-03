import HeroSection from "@/components/hero-section"
import ProjectsSection from "@/components/projects-section"
import SkillsSection from "@/components/skills-section"
import ContactSection from "@/components/contact-section"
import { getGithubRepos } from "@/lib/github"
import { makeRepoSVG, formatDate } from "@/lib/utils"

export default async function Home() {
  // Fetch projects data on the server
  const { repos } = await getGithubRepos("chocoOnEstrogen")
  
  // Transform GitHub repos into project format
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
    <>
      <HeroSection />
      <ProjectsSection initialProjects={projects} />
      <SkillsSection />
      <ContactSection />
    </>
  )
}

