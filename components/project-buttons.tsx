'use client'

import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"

interface ProjectButtonsProps {
  project: {
    html_url: string
    homepage?: string
  }
}

export function ProjectButtons({ project }: ProjectButtonsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Button 
        className="rounded-full px-6" 
        onClick={() => window.open(project.html_url, '_blank')}
      >
        <Github className="mr-2 h-4 w-4" />
        View on GitHub
      </Button>
      {project.homepage && (
        <Button 
          variant="outline" 
          className="rounded-full px-6" 
          onClick={() => window.open(project.homepage, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Live Demo
        </Button>
      )}
    </div>
  )
} 