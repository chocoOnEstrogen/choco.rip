'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Copy, Terminal } from "lucide-react"
import { motion } from "framer-motion"

interface CloneInstructionsProps {
  repoUrl: string
}

export function CloneInstructions({ repoUrl }: CloneInstructionsProps) {
  const [copied, setCopied] = useState(false)

  const command = `git clone ${window.location.origin}/git/${repoUrl}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Card className="border-pink-100 dark:border-pink-900/30">
      <CardHeader>
        <CardTitle className="text-xl">Clone Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Clone the repository</h3>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-950 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-800 shadow-lg">
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-pink-400" />
                  <code className="text-sm text-zinc-100 font-mono font-medium tracking-wide">{command}</code>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-pink-400 hover:bg-zinc-800/50 transition-colors"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}