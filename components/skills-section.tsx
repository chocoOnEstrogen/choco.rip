"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, Heart, Zap } from "lucide-react"
import SkillCard from "@/components/skill-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SkillsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeCategory, setActiveCategory] = useState("frontend")

  const skills = {
    frontend: [
      { name: "TypeScript", level: 95, icon: "📘", color: "from-blue-400 to-indigo-500", description: "Type safety & modern JS features" },
      { name: "JavaScript", level: 90, icon: "⚡", color: "from-yellow-400 to-amber-500", description: "Web development & scripting" },
      { name: "HTML5", level: 95, icon: "🌐", color: "from-orange-400 to-red-500", description: "Web markup & semantics" },
      { name: "Nuxt.js", level: 85, icon: "🟢", color: "from-green-400 to-teal-500", description: "Vue.js framework" },
    ],
    backend: [
      { name: "Python", level: 90, icon: "🐍", color: "from-blue-400 to-indigo-500", description: "Scripting & automation" },
      { name: "Rust", level: 85, icon: "🦀", color: "from-orange-400 to-red-500", description: "Systems programming" },
      { name: "C", level: 80, icon: "🔧", color: "from-blue-400 to-cyan-500", description: "Low-level programming" },
      { name: "C#", level: 75, icon: "💜", color: "from-purple-400 to-pink-500", description: "Windows applications" },
    ],
    other: [
      { name: "Git", level: 95, icon: "🔄", color: "from-orange-400 to-red-500", description: "Version control & CI/CD" },
      { name: "Discord.js", level: 90, icon: "🤖", color: "from-indigo-400 to-purple-500", description: "Bot development" },
      { name: "Cloud Services", level: 85, icon: "☁️", color: "from-blue-400 to-cyan-500", description: "Azure & Cloudflare" },
      { name: "Open Source", level: 95, icon: "🌟", color: "from-yellow-400 to-amber-500", description: "Community contributions" },
    ]
  }

  const categories = [
    { id: "frontend", label: "Frontend", icon: Star },
    { id: "backend", label: "Backend", icon: Zap },
    { id: "other", label: "Other", icon: Heart }
  ]

  return (
    <section id="skills" className="py-20 md:py-32 bg-gradient-to-b from-pink-50/50 to-white dark:from-pink-950/10 dark:to-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col gap-16">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-2 text-center"
          >
            <Badge
              variant="outline"
              className="w-fit mx-auto rounded-full px-4 py-1 text-sm bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1 text-pink-500" />
              <span>My Skills</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              I combine technical expertise with a passion for cute design to create experiences that are both
              functional and delightful.
            </p>
          </motion.div>

          <div className="flex justify-center gap-4 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="lg"
                className={cn(
                  "rounded-full transition-all duration-300",
                  activeCategory === category.id
                    ? "bg-pink-500 hover:bg-pink-600 text-white"
                    : "border-pink-200 dark:border-pink-800 hover:bg-pink-100/50 dark:hover:bg-pink-900/20"
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.label}
              </Button>
            ))}
          </div>

          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {skills[activeCategory as keyof typeof skills].map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <SkillCard skill={skill} isInView={isInView} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
