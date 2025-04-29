import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import config from "@/config"
import { getBlogPosts } from "@/lib/blog"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts, tutorials, and insights on web development, open source, and more.",
  keywords: "blog, web development, open source, tutorials, insights",
  openGraph: {
    title: "Blog",
    description: "Thoughts, tutorials, and insights on web development, open source, and more.",
    type: "website",
    url: config.url + "/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description: "Thoughts, tutorials, and insights on web development, open source, and more.",
  },
  alternates: {
    canonical: config.url + "/blog",
  },
}

export default async function BlogPage() {
  const { posts, metadata } = await getBlogPosts()

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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Blog</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Thoughts, tutorials, and insights on web development, open source, and more.
            </p>
          </div>

          {/* Year and Month Navigation */}
          <div className="flex flex-wrap gap-4 mt-4">
            {metadata.years.map((year) => (
              <div key={year} className="flex flex-col gap-2">
                <Link
                  href={`/blog/${year}`}
                  className="text-pink-500 hover:text-pink-600 transition-colors font-medium"
                >
                  {year}
                </Link>
                <div className="flex flex-wrap gap-2">
                  {metadata.months[year].map((month) => (
                    <Link
                      key={month}
                      href={`/blog/${year}/${month}`}
                      className="text-sm text-muted-foreground hover:text-pink-500 transition-colors"
                    >
                      {format(new Date(year, month - 1), "MMM")}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {metadata.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full text-xs px-2 py-0.5 border-pink-200 dark:border-pink-800"
              >
                {tag}
              </Badge>
            ))}
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