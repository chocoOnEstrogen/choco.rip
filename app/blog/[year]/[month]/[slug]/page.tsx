import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import config from "@/config"
import { getBlogPost } from "@/lib/blog"
import BlogContent from "@/components/blog-content"

interface PageParams {
  year: string
  month: string
  slug: string
}

interface PageProps {
  params: Promise<PageParams>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const post = await getBlogPost(resolvedParams.slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [config.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({
  params,
}: PageProps) {
  const resolvedParams = await params
  const post = await getBlogPost(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="container px-4 md:px-6 py-20 md:py-32">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Badge
              variant="outline"
              className="w-fit rounded-full px-4 py-1 text-sm bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
            >
              <span>Blog</span>
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{post.title}</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              {format(new Date(post.date), "MMMM d, yyyy")}
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="rounded-full text-xs px-2 py-0.5 border-pink-200 dark:border-pink-800">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <BlogContent content={post.html} />
      </div>
    </div>
  )
}