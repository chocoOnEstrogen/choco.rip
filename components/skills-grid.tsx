"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import {
  Heading5Icon as Html5,
  CodepenIcon as Css3,
  FileJson2,
  FramerIcon as FramerLogo,
  Github,
  Database,
  Figma,
  Layers,
  Palette,
  Code2,
  Cpu,
  Boxes,
} from "lucide-react"

interface Skill {
  name: string
  icon: React.ReactNode
  color: string
}

export default function SkillsGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const skills: Skill[] = [
    { name: "HTML", icon: <Html5 className="h-8 w-8" />, color: "text-orange-500" },
    { name: "CSS", icon: <Css3 className="h-8 w-8" />, color: "text-blue-500" },
    { name: "JavaScript", icon: <FileJson2 className="h-8 w-8" />, color: "text-yellow-500" },
    { name: "React", icon: <Boxes className="h-8 w-8" />, color: "text-cyan-500" },
    { name: "Next.js", icon: <Cpu className="h-8 w-8" />, color: "text-gray-800 dark:text-gray-200" },
    { name: "TypeScript", icon: <Code2 className="h-8 w-8" />, color: "text-blue-600" },
    { name: "Tailwind CSS", icon: <Palette className="h-8 w-8" />, color: "text-teal-500" },
    { name: "Framer Motion", icon: <FramerLogo className="h-8 w-8" />, color: "text-purple-600" },
    { name: "Git", icon: <Github className="h-8 w-8" />, color: "text-orange-600" },
    { name: "Databases", icon: <Database className="h-8 w-8" />, color: "text-green-600" },
    { name: "UI/UX", icon: <Figma className="h-8 w-8" />, color: "text-pink-600" },
    { name: "Architecture", icon: <Layers className="h-8 w-8" />, color: "text-indigo-600" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {skills.map((skill, index) => (
        <motion.div
          key={skill.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className="relative"
        >
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <motion.div
                animate={{
                  scale: hoveredIndex === index ? 1.2 : 1,
                  y: hoveredIndex === index ? -5 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className={skill.color}
              >
                {skill.icon}
              </motion.div>
              <h3 className="mt-3 text-center text-sm font-medium">{skill.name}</h3>
            </CardContent>
          </Card>
          {hoveredIndex === index && (
            <motion.div
              layoutId="highlight"
              className="absolute inset-0 rounded-lg border-2 border-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}

