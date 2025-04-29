import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import config from "@/config"
import { getBlogPosts } from "@/lib/blog"
import Link from "next/link"
import { notFound } from "next/navigation"

interface MonthPageProps {
  params: Promise<{
    year: string
    month: string
  }>
}

export async function generateMetadata({ params }: MonthPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const year = parseInt(resolvedParams.year)
  const month = parseInt(resolvedParams.month)
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) notFound()

  const monthName = format(new Date(year, month - 1), "MMMM")
  return {
    title: `Blog Posts from ${monthName} ${year}`,
    description: `Blog posts from ${monthName} ${year}`,
    openGraph: {
      title: `Blog Posts from ${monthName} ${year}`,
      description: `Blog posts from ${monthName} ${year}`,
      type: "website",
      url: `${config.url}/blog/${year}/${month}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `Blog Posts from ${monthName} ${year}`,
      description: `Blog posts from ${monthName} ${year}`,
    },
    alternates: {
      canonical: `${config.url}/blog/${year}/${month}`,
    },
  }
}

export default async function MonthPage({ params }: MonthPageProps) {
  const resolvedParams = await params
  const year = parseInt(resolvedParams.year)
  const month = parseInt(resolvedParams.month)
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) notFound()

  const { posts, metadata } = await getBlogPosts(year, month)

  if (posts.length === 0) notFound()

  const monthName = format(new Date(year, month - 1), "MMMM")

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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Blog Posts from {monthName} {year}</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              All blog posts published in {monthName} {year}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Link
              href={`/blog/${year}`}
              className="text-pink-500 hover:text-pink-600 transition-colors font-medium"
            >
              ← Back to {year}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.slug} className="hover:shadow-lg transition-shadow border-pink-100 dark:border-pink-900/30">
              <CardHeader>
                <CardTitle className="text-pink-700 dark:text-pink-300">{post.title}</CardTitle>
                <CardDescription>{format(new Date(post.date), "MMMM d, yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{post.description}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-full text-xs px-2 py-0.5 border-pink-200 dark:border-pink-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardContent>
                <Link
                  href={`/blog/${format(new Date(post.date), "yyyy/MM")}/${post.slug}`}
                  className="text-pink-500 hover:text-pink-600 transition-colors"
                >
                  Read more →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 