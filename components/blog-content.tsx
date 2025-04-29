"use client"

import "@/app/styles/markdown.css"
import "@/app/styles/highlight.css"
import { useEffect } from "react"
import hljs from "highlight.js"

/**
 * BlogContent component that renders markdown content with syntax highlighting
 * @param {Object} props - Component props
 * @param {string} props.content - The HTML content to render
 */
export default function BlogContent({ content }: { content: string }) {
    useEffect(() => {
        // Initialize syntax highlighting
        hljs.highlightAll()
    }, [content])

    return (
        <article className="prose prose-pink dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </article>
    )
}