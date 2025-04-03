"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import config from "@/config"
import { Github, Mail, MapPin, Menu, X, Twitter, Linkedin } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"

function isHomePage(pathname: string) {
  return pathname === "/"
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      
      // Update active section based on scroll position
      const sections = ["projects", "skills", "contact"]
      const scrollPosition = window.scrollY + 100
      
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Projects", href: isHomePage(pathname) ? "#projects" : "/#projects" },
    { name: "Skills", href: isHomePage(pathname) ? "#skills" : "/#skills" },
    { name: "Contact", href: isHomePage(pathname) ? "#contact" : "/#contact" },
    { name: "VTubers.TV", href: "/vtubers.tv", label: "VTubers.TV" },
  ]

  const socialLinks = [
    { icon: Mail, href: `mailto:${config.email}`, label: "Email" },
    { icon: Github, href: config.github, label: "GitHub" },
  ]

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-background/90 backdrop-blur-lg border-b border-pink-200/30 dark:border-pink-900/30 shadow-lg" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <motion.div 
            className="flex items-center gap-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-pink-200 dark:border-pink-800 shadow-lg"
              >
                <Image
                  src={config.avatar}
                  alt={config.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </motion.div>
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent group-hover:from-pink-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                {config.name}
              </motion.span>
            </Link>
            
            <nav className="hidden md:flex gap-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href || activeSection === item.href.split("#")[1]
                return (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium relative group ${
                      isActive 
                        ? "text-pink-500" 
                        : "text-muted-foreground hover:text-pink-500"
                    }`}
                  >
                    {item.name}
                    <motion.span 
                      className={`absolute -bottom-1 left-0 h-0.5 bg-pink-500 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                )
              })}
            </nav>
          </motion.div>

          <div className="flex items-center gap-6">

            <Badge 
              variant="outline" 
              className="hidden md:flex rounded-full text-xs px-4 py-1.5 border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-900/10"
            >
              {config.description}
            </Badge>

            <button 
              className="md:hidden p-2 text-muted-foreground hover:text-pink-500 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-20 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-pink-200/30 dark:border-pink-900/30 shadow-lg"
          >
            <div className="container mx-auto px-4 py-6 space-y-6">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link 
                    href={item.href}
                    className={`block text-lg font-medium ${
                      pathname === item.href || activeSection === item.href.split("#")[1]
                        ? "text-pink-500"
                        : "text-muted-foreground hover:text-pink-500"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-6 border-t border-pink-200/30 dark:border-pink-900/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{config.location}</span>
                </div>
                <div className="flex items-center gap-4">
                  {socialLinks.map(({ icon: Icon, href, label }) => (
                    <Link 
                      key={label}
                      href={href}
                      target={label !== "Email" ? "_blank" : undefined}
                      rel={label !== "Email" ? "noopener noreferrer" : undefined}
                      className="p-2 text-muted-foreground hover:text-pink-500 transition-colors"
                      aria-label={label}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}