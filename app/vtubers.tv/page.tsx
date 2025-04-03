import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Users, Code, Heart, Star } from "lucide-react"
import Link from "next/link"
import config from "@/config"

export const metadata: Metadata = {
  title: "VTubers.TV - Open Source VTuber Streaming Platform",
  icons: {
    icon: config.avatar,
    shortcut: config.avatar,
    apple: config.avatar,
  },
  description: "An open-source, non-profit streaming platform designed specifically for VTuber content. Built by the community, for the community.",
  keywords: "vtubers, streaming, open source, live streaming, virtual youtuber, vtuber platform",
  openGraph: {
    title: "VTubers.TV - Open Source VTuber Streaming Platform",
    description: "An open-source, non-profit streaming platform designed specifically for VTuber content.",
    type: "website",
    url: config.url + "/vtubers.tv",
    images: [
      {
        url: config.url + "/images/bg.gif",
        width: 1200,
        height: 630,
        alt: "VTubers.TV Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VTubers.TV - Open Source VTuber Streaming Platform",
    description: "An open-source, non-profit streaming platform designed specifically for VTuber content.",
    images: [config.url + "/images/bg.gif"],
  },
  alternates: {
    canonical: config.url + "/vtubers.tv",
  },
}

const features = [
  {
    title: "VTuber-First Design",
    description: "Built specifically for VTuber content with features tailored to VTuber creators and viewers.",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    title: "Open Source",
    description: "Transparent development with community-driven features and improvements.",
    icon: <Code className="w-6 h-6" />,
  },
  {
    title: "Community Focus",
    description: "Platform decisions driven by community needs, not corporate interests.",
    icon: <Users className="w-6 h-6" />,
  },
  {
    title: "Security First",
    description: "Robust security measures and privacy protection for all users.",
    icon: <Shield className="w-6 h-6" />,
  },
]

const governanceFeatures = [
  "Democratic decision making",
  "Transparent operations",
  "Community-driven features",
  "Fair monetization",
  "Open development",
]

const securityFeatures = [
  "JWT-based authentication",
  "OAuth 2.0 integration",
  "End-to-end encryption",
  "Regular security audits",
  "GDPR compliance",
]

export default function VTubersTVPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-pink-50/50 dark:from-background dark:to-pink-950/10">
      <div className="container px-4 md:px-6 py-20 md:py-32">
        {/* Hero Section */}
        <section className="text-center py-12">
          <Badge
            variant="outline"
            className="w-fit mx-auto rounded-full px-4 py-1 text-sm bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
          >
            <Heart className="h-3.5 w-3.5 mr-1 text-pink-500" />
            <span>VTuber Streaming Platform</span>
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Welcome to <span className="text-primary">VTubers.TV</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            An open-source, non-profit streaming platform designed specifically for VTuber content.
            Built by the community, for the community.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full border-pink-200 dark:border-pink-800">
              <Link href="https://github.com/VTubersTV" target="_blank">
                View on GitHub <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-full border-pink-200 dark:border-pink-800">
              <Link href="/vtubers.tv/helix">
                Try Helix ID Generator <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Why Choose VTubers.TV?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-pink-100 dark:border-pink-900/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <CardTitle className="text-pink-700 dark:text-pink-300">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Governance Section */}
        <section className="py-12">
          <Card className="border-pink-100 dark:border-pink-900/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-pink-500" />
                <CardTitle className="text-pink-700 dark:text-pink-300">Community Governance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Core Team Structure</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Small group of trusted maintainers (3-5 members)</li>
                    <li>Led by project founder</li>
                    <li>1-year terms with possibility of renewal</li>
                    <li>Technical direction and architecture decisions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {governanceFeatures.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="rounded-full bg-pink-100/50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-none">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Security Section */}
        <section className="py-12">
          <Card className="border-pink-100 dark:border-pink-900/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-pink-500" />
                <CardTitle className="text-pink-700 dark:text-pink-300">Security & Privacy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Security Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {securityFeatures.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="rounded-full bg-pink-100/50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-none">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Compliance</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Regular security audits</li>
                    <li>GDPR compliance</li>
                    <li>Data protection verification</li>
                    <li>Privacy policy enforcement</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Versioning Section */}
        <section className="py-12">
          <Card className="border-pink-100 dark:border-pink-900/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-pink-500" />
                <CardTitle className="text-pink-700 dark:text-pink-300">Versioning System</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Internal Versioning</h3>
                  <p className="mb-2">Format: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]</p>
                  <div className="space-y-2">
                    <Badge variant="outline" className="rounded-full border-pink-200 dark:border-pink-800">Standard: 1.0.0</Badge>
                    <Badge variant="outline" className="rounded-full border-pink-200 dark:border-pink-800">Pre-release: 1.0.0-alpha.1</Badge>
                    <Badge variant="outline" className="rounded-full border-pink-200 dark:border-pink-800">Build metadata: 1.0.0+build123</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Public Versioning</h3>
                  <p className="mb-2">Thematic version names for public releases</p>
                  <div className="space-y-2">
                    <Badge variant="outline" className="rounded-full border-pink-200 dark:border-pink-800">Aurora-1.1</Badge>
                    <Badge variant="outline" className="rounded-full border-pink-200 dark:border-pink-800">Nebula-2.0-beta</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Join the Community</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the future of VTuber streaming. Contribute, stream, or just enjoy the content!
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" size="lg" asChild className="rounded-full border-pink-200 dark:border-pink-800">
              <Link href="https://vtubers.tv/discord" target="_blank">
                Join Discord <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
