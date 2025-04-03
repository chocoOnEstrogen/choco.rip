"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Download, Github, Star } from "lucide-react"
import FloatingElements from "@/components/floating-elements"
import config from "@/config"
export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, -100])
  const y2 = useTransform(scrollY, [0, 500], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-40">
      <FloatingElements />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Badge
                  variant="outline"
                  className="w-fit rounded-full px-4 py-1 text-sm bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
                >
                  <Star className="h-3.5 w-3.5 mr-1 text-pink-500" />
                  <span>Full Stack Developer & Open Source Enthusiast</span>
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Building{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                  Innovative
                </span>{" "}
                Digital Solutions
              </motion.h1>

              <motion.p
                className="text-lg text-muted-foreground mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Passionate about creating scalable web applications, developer tools, and contributing to the open-source community.
                Currently working on VTubersTV and other exciting projects.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button size="lg" className="rounded-full px-6 group">
                <span>View Projects</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-6" onClick={() => window.open(config.github, "_blank")}>
                <Github className="mr-2 h-4 w-4" />
                <span>GitHub</span>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div className="relative" style={{ y: y1, opacity }}>
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-200 to-purple-300 dark:from-pink-800/30 dark:to-purple-900/30 blur-3xl opacity-30" />

              <div className="relative z-10 w-full h-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-pink-100 dark:bg-pink-900/20 rounded-full" />

                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <Image
                    src={config.avatar}
                    unoptimized={config.avatar.includes(".gif")}
                    alt={config.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain rounded-full"
                  />
                </motion.div>

                <motion.div
                  className="absolute top-10 right-10 p-3 bg-white dark:bg-pink-950 rounded-xl shadow-lg"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 3, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: 1,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                      <Github className="h-4 w-4 text-pink-700 dark:text-pink-300" />
                    </div>
                    <div className="text-xs">
                      <div className="font-medium">VTubersTV</div>
                      <div className="text-muted-foreground">Coming Soon</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-10 left-10 p-3 bg-white dark:bg-pink-950 rounded-xl shadow-lg"
                  animate={{
                    y: [0, 5, 0],
                    rotate: [0, -3, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: 0.5,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <span className="text-lg font-medium text-purple-700 dark:text-purple-300">⚡</span>
                    </div>
                    <div className="text-xs">
                      <div className="font-medium">Flux</div>
                      <div className="text-muted-foreground">Modern Shell</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"
        style={{ opacity }}
      />
    </section>
  )
}

