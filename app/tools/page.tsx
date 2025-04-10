import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare, Github, Code, Heart } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Tools & Utilities",
  description: "A collection of useful tools and utilities for developers and creators.",
  keywords: "tools, utilities, discord, github, profile card, generator",
}

const tools = [
  {
    title: "Discord Profile Card Generator",
    description: "Generate beautiful Discord profile cards for your website or social media profiles.",
    icon: <MessageSquare className="h-6 w-6 text-indigo-500" />,
    href: "/tools/discord-profile",
    color: "border-indigo-100 dark:border-indigo-900/30",
    badgeColor: "bg-indigo-100/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300",
  },
]

export default function ToolsPage() {
  return (
    <div className="container px-4 md:px-6 py-20 md:py-32">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Badge
              variant="outline"
              className="w-fit rounded-full px-4 py-1 text-sm bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
            >
              <span>Tools & Utilities</span>
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Tools & Utilities</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              A collection of useful tools and utilities to help you be more productive and creative.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool, index) => (
            <Card key={index} className={`${tool.color} hover:shadow-lg transition-shadow`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {tool.icon}
                  <CardTitle>{tool.title}</CardTitle>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline" className={`${tool.badgeColor} border-none`}>
                  <Link href={tool.href}>
                    Try it out <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 