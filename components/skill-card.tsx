"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface Skill {
  name: string
  level: number
  icon: string
  color: string
}

interface SkillCardProps {
  skill: Skill
  index: number
  isInView: boolean
}

export default function SkillCard({ skill, index, isInView }: SkillCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 * index + 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden border-pink-100 dark:border-pink-900 group">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <motion.div
              className={`h-10 w-10 rounded-full bg-gradient-to-br ${skill.color} flex items-center justify-center text-white`}
              animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-lg">{skill.icon}</span>

              {isHovered && (
                <motion.div
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-pink-100 dark:bg-pink-900 border-2 border-white dark:border-pink-950 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="text-[8px] text-pink-500">✨</span>
                </motion.div>
              )}
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{skill.name}</h4>
                <span className="text-xs text-muted-foreground">{skill.level}%</span>
              </div>

              <div className="mt-1.5 h-2 w-full bg-pink-100 dark:bg-pink-900/30 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${skill.color}`}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${skill.level}%` } : {}}
                  transition={{ duration: 1, delay: 0.2 * index + 0.5 }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

