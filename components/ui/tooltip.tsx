"use client"

import * as React from "react"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
}

export function Tooltip({ children, content, className }: TooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className={`
        absolute left-1/2 -translate-x-1/2 bottom-full mb-2
        px-2 py-1 text-xs rounded-md
        bg-background border border-pink-200 dark:border-pink-800
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200
        ${className}
      `}>
        {content}
      </div>
    </div>
  )
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function TooltipTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function TooltipContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
} 