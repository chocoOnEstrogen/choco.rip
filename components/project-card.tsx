"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Github, Heart } from "lucide-react"
import Link from "next/link"

interface Project {
  id: number
  title: string
  description: string
  tags: string[]
  category: string
  featured?: boolean
  html_url: string
}

interface ProjectCardProps {
  project: Project
  index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
    >
      <Card
        className="overflow-hidden border-pink-100 dark:border-pink-900 group hover:border-pink-200 dark:hover:border-pink-800 transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={project.html_url}>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {project.title}
                </h3>
                <motion.button
                  className="h-8 w-8 rounded-full bg-pink-100/50 dark:bg-pink-900/20 flex items-center justify-center text-pink-500 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(project.html_url, "_blank")
                  }}
                >
                  <Heart className="h-4 w-4" />
                </motion.button>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full text-xs bg-pink-100/50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-none"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button size="sm" className="rounded-full bg-pink-100/50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-800">
                  <span>View Project</span>
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 hover:bg-pink-100/50 dark:hover:bg-pink-900/20"
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(project.html_url, "_blank")
                  }}
                >
                  <Github className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  )
}
