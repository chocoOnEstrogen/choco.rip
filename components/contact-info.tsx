"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Mail, MapPin, Phone, Github, Twitter, Linkedin, Instagram } from "lucide-react"
import config from "@/config"

export default function ContactInfo() {
  const contactItems = [
    {
      icon: <Mail className="h-5 w-5 text-pink-500" />,
      label: "Email",
      value: config.email,
      href: "mailto:" + config.email,
    },
    {
      icon: <MapPin className="h-5 w-5 text-pink-500" />,
      label: "Location",
      value: config.location,
      href: "#",
    },
  ]

  const socialLinks = [
    {
      icon: <Github className="h-5 w-5" />,
      label: "GitHub",
      href: config.socials?.github,
    }
  ].filter(link => link.href !== undefined)

  return (
    <div className="flex flex-col h-full justify-between gap-8">
      <div>
        <h3 className="text-xl font-bold mb-6">Contact Information</h3>

        <div className="space-y-6">
          {contactItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <Link href={item.href} className="font-medium hover:text-pink-500 transition-colors">
                  {item.value}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-6">Follow Me</h3>

        <div className="flex flex-wrap gap-3">
          {socialLinks.map((link, index) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -3 }}
            >
              <Link
                href={link.href || ""}
                className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800/30 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.icon}
                <span className="sr-only">{link.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-pink-100/50 dark:bg-pink-900/20 rounded-xl p-4 border border-pink-200 dark:border-pink-800">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💻</div>
          <div>
            <p className="text-sm font-medium">Need help with your project?</p>
            <p className="text-xs text-muted-foreground mt-1">
              I'm available for consulting and development work!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

