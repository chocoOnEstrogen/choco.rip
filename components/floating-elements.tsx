"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

interface FloatingElement {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  shape: "circle" | "heart" | "star" | "square"
}

export default function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([])
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)

    // Generate random floating elements
    const newElements: FloatingElement[] = []
    const shapes = ["circle", "heart", "star", "square"]

    for (let i = 0; i < 20; i++) {
      newElements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 40 + 10,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        shape: shapes[Math.floor(Math.random() * shapes.length)] as any,
      })
    }

    setElements(newElements)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute ${getShapeClass(element.shape, isDark)} blur-sm opacity-20`}
          style={{
            width: element.size,
            height: element.size,
            left: `${element.x}%`,
            top: `${element.y}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

function getShapeClass(shape: string, isDark: boolean): string {
  const baseColors = {
    circle: isDark ? "bg-pink-600" : "bg-pink-300",
    heart: isDark ? "bg-red-600" : "bg-red-300",
    star: isDark ? "bg-purple-600" : "bg-purple-300",
    square: isDark ? "bg-blue-600" : "bg-blue-300",
  }

  switch (shape) {
    case "circle":
      return `rounded-full ${baseColors.circle}`
    case "heart":
      return `heart-shape ${baseColors.heart}`
    case "star":
      return `star-shape ${baseColors.star}`
    case "square":
      return `rounded-lg ${baseColors.square}`
    default:
      return `rounded-full ${baseColors.circle}`
  }
}

