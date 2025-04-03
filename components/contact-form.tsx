"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, CheckCircle2, Heart, MessageSquare, User, Mail } from "lucide-react"
import { storeSubmission } from "@/lib/indexedDB"

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      console.log('Form submission successful, storing in IndexedDB:', data)
      
      try {
        await storeSubmission({
          requestId: data.requestId,
          sessionId: data.sessionId,
          timestamp: new Date().toISOString()
        });
        console.log('Successfully stored in IndexedDB');
      } catch (dbError) {
        console.error('Failed to store in IndexedDB:', dbError);
        // Don't throw here, we still want to show success to user
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="text-red-500 text-center">
          {error}
        </div>
        <Button
          onClick={() => setError(null)}
          variant="outline"
          className="rounded-full px-6 border-pink-200 dark:border-pink-800"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, 0, -10, 0] }}
          transition={{ duration: 0.6 }}
          className="rounded-full bg-pink-100 dark:bg-pink-900/30 p-4"
        >
          <CheckCircle2 className="h-8 w-8 text-pink-500" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold"
        >
          Message Sent!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-muted-foreground"
        >
            Thank you for reaching out. I'll get back to you as soon as possible!{" "}
          <Heart className="inline h-4 w-4 text-pink-500" />
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="rounded-full px-6 border-pink-200 dark:border-pink-800"
          >
            Send Another Message
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              value={formState.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="rounded-xl pl-10 border-pink-200 dark:border-pink-800 focus:border-pink-500 focus:ring-pink-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              type="email"
              placeholder="Your email"
              required
              className="rounded-xl pl-10 border-pink-200 dark:border-pink-800 focus:border-pink-500 focus:ring-pink-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm font-medium">
            Message
          </Label>
          <div className="relative">
            <Textarea
              id="message"
              name="message"
              value={formState.message}
              onChange={handleChange}
              placeholder="Your message"
              rows={5}
              required
              className="rounded-xl pt-10 border-pink-200 dark:border-pink-800 focus:border-pink-500 focus:ring-pink-500"
            />
            <div className="absolute left-3 top-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tell me about your project!</span>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/20"
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  )
}

