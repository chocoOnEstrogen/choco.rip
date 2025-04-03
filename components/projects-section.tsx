"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ExternalLink, Github, Heart, ArrowUpDown } from "lucide-react"
import ProjectCard from "@/components/project-card"
import { makeRepoSVG } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import config from "@/config"

// Add interfaces for type safety
interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  featured?: boolean;
  github_url: string;
  demo_url: string | null;
  stars: number;
  forks: number;
  issues: number;
  updated_at: string;
  created_at: string;
  html_url: string;
}

interface Filter {
  id: string;
  label: string;
}

type SortOption = "stars" | "updated" | "created" | "forks" | "issues";

interface ProjectsSectionProps {
  initialProjects: Project[];
}

export default function ProjectsSection({ initialProjects }: ProjectsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeFilter, setActiveFilter] = useState("all")
  const [projects] = useState<Project[]>(initialProjects)
  const [sortBy, setSortBy] = useState<SortOption>("stars")
  const [filters, setFilters] = useState<Filter[]>([
    { id: "all", label: "All Projects" },
  ])

  useEffect(() => {
    // Get top 5 most frequent tags
    const tagFrequency = new Map<string, number>();
    projects.forEach(project => {
      project.tags.forEach(tag => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // Create filters from top tags
    const tagFilters: Filter[] = topTags.map(tag => ({
      id: tag,
      label: tag.charAt(0).toUpperCase() + tag.slice(1)
    }))

    const newFilters = [
      { id: "all", label: "All Projects" },
      ...tagFilters
    ]

    setFilters(newFilters)
  }, [projects])

  const sortProjects = (projects: Project[], sortBy: SortOption) => {
    return [...projects].sort((a, b) => {
      switch (sortBy) {
        case "stars":
          return b.stars - a.stars;
        case "forks":
          return b.forks - a.forks;
        case "issues":
          return b.issues - a.issues;
        case "updated":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  };

  const filteredProjects = sortProjects(
    activeFilter === "all" 
      ? projects 
      : projects.filter((project) => project.tags.includes(activeFilter)),
    sortBy
  );

  const featuredProject = projects.find((project) => project.featured)

  return (
    <section id="projects" className="py-20 md:py-32 bg-pink-50/50 dark:bg-pink-950/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-2"
            >
              <Badge
                variant="outline"
                className="w-fit rounded-full px-4 py-1 text-sm bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
              >
                <Heart className="h-3.5 w-3.5 mr-1 text-pink-500" />
                <span>My Projects</span>
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Open Source Projects</h2>
              <p className="text-muted-foreground max-w-2xl text-lg">
                A collection of my open source contributions and personal projects. Each project is crafted with attention to detail and a focus on developer experience.
              </p>
            </motion.div>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap gap-2"
              >
                {filters.map((filter, index) => (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full ${
                      activeFilter === filter.id
                        ? "bg-pink-500 hover:bg-pink-600 text-white"
                        : "border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/20"
                    }`}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full border-pink-200 dark:border-pink-800 hover:bg-pink-100/50 dark:hover:bg-pink-900/20 transition-colors duration-200"
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2 text-pink-500" />
                      <span className="text-pink-700 dark:text-pink-300">
                        Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 bg-white dark:bg-pink-950/90 border-pink-200 dark:border-pink-800 shadow-lg"
                  >
                    {[
                      { id: "stars", label: "Stars" },
                      { id: "forks", label: "Forks" },
                      { id: "issues", label: "Issues" },
                      { id: "updated", label: "Last Updated" },
                      { id: "created", label: "Date Created" }
                    ].map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => setSortBy(option.id as SortOption)}
                        className="text-pink-700 dark:text-pink-300 hover:bg-pink-100/50 dark:hover:bg-pink-900/20 cursor-pointer focus:bg-pink-100/50 dark:focus:bg-pink-900/20"
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </div>
          </div>

          {featuredProject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white dark:bg-pink-950/20 rounded-3xl p-6 md:p-8 shadow-sm"
            >
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <div className="absolute top-4 left-4">
                  <Badge className="bg-pink-500 text-white hover:bg-pink-600">Featured</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-2xl font-bold">{featuredProject.title}</h3>
                  <p className="text-muted-foreground mt-2">{featuredProject.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {featuredProject.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-none"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-4 mt-4">
                  <Button className="rounded-full px-4 group">
                    <span>View Project</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => window.open(featuredProject.github_url, '_blank')}>
                    <Github className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full" 
                    onClick={() => featuredProject.demo_url && window.open(featuredProject.demo_url, '_blank')}
                    disabled={!featuredProject.demo_url}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects
              .filter((project) => !project.featured)
              .map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center mt-8"
          >
            <Button variant="outline" className="rounded-full px-6 border-pink-200 dark:border-pink-800" onClick={() => window.open(config.github, '_blank')}>
              <span>View All Projects</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

