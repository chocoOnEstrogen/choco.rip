import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Phone, MessageSquare, Shield, Users, Code, BookOpen } from "lucide-react"
import Link from "next/link"
import config from "@/config"

export const metadata: Metadata = {
  title: "Transgender Resources & Support",
  icons: {
    icon: config.avatar,
    shortcut: config.avatar,
    apple: config.avatar,
  },
  description: "A comprehensive collection of resources, support services, and information for the transgender community. Remember, you're not alone in this journey.",
  keywords: "transgender resources, trans support, crisis support, mental health, healthcare, legal resources, community support, trans healthcare, LGBTQ+ support",
  openGraph: {
    title: "Transgender Resources & Support",
    description: "A comprehensive collection of resources, support services, and information for the transgender community. Remember, you're not alone in this journey.",
    type: "website",
    url: config.url + "/trans-help",
    images: [
      {
        url: config.url + "/images/bg.gif",
        width: 1200,
        height: 630,
        alt: "Transgender Resources & Support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Transgender Resources & Support",
    description: "A comprehensive collection of resources, support services, and information for the transgender community. Remember, you're not alone in this journey.",
    images: [config.url + "/images/bg.gif"],
  },
  alternates: {
    canonical: config.url + "/trans-help",
  },
}

const crisisSupport = [
  {
    name: "Trans Lifeline",
    number: "877-565-8860",
    description: "Peer support hotline run by and for trans people",
    icon: <Phone className="w-6 h-6" />,
  },
  {
    name: "Trevor Project",
    number: "866-488-7386",
    description: "24/7 crisis support for LGBTQ+ youth",
    icon: <MessageSquare className="w-6 h-6" />,
  },
  {
    name: "Crisis Text Line",
    number: "741741",
    description: "Text HOME to connect with a counselor",
    icon: <MessageSquare className="w-6 h-6" />,
  },
]

const resources = [
  {
    title: "Mental Health Resources",
    items: [
      "Pride Counseling - LGBTQ+ Focused Online Therapy",
      "GALAP Directory - Free Letters for Gender-Affirming Care",
      "Trans Mental Health Hub - Mental Health Resources & Support",
    ],
    icon: <Heart className="w-6 h-6" />,
  },
  {
    title: "Healthcare Resources",
    items: [
      "Planned Parenthood - Gender-Affirming Healthcare Services",
      "FOLX Health - Virtual Trans Healthcare Provider",
      "Plume - Telehealth HRT Services",
    ],
    icon: <Shield className="w-6 h-6" />,
  },
  {
    title: "Legal Resources",
    items: [
      "Transgender Law Center - Legal Support & Advocacy",
      "National Center for Transgender Equality - Policy & Legal Resources",
      "Trans Legal Defense - Legal Support Services",
    ],
    icon: <Code className="w-6 h-6" />,
  },
  {
    title: "Community Support",
    items: [
      "PFLAG - Family & Ally Support Network",
      "Gender Spectrum - Support for Trans Youth & Families",
      "Point of Pride - Financial Aid & Resources",
    ],
    icon: <Users className="w-6 h-6" />,
  },
]

export default function TransHelpPage() {
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
            <span>Transgender Resources & Support</span>
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            You Are Not Alone
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive collection of resources, support services, and information for the transgender community.
            Remember, you're not alone in this journey.
          </p>
        </section>

        {/* Crisis Support Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            24/7 Crisis Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {crisisSupport.map((support, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-pink-100 dark:border-pink-900/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {support.icon}
                    <CardTitle className="text-pink-700 dark:text-pink-300">{support.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg font-semibold mb-2">{support.number}</CardDescription>
                  <CardDescription>{support.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Resources & Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-pink-100 dark:border-pink-900/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {resource.icon}
                    <CardTitle className="text-pink-700 dark:text-pink-300">{resource.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {resource.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Educational Resources */}
        <section className="py-12">
          <Card className="border-pink-100 dark:border-pink-900/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-pink-500" />
                <CardTitle className="text-pink-700 dark:text-pink-300">Educational Resources</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Gender Dysphoria Bible</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive Information Guide</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Trans Hub</h3>
                  <p className="text-sm text-muted-foreground">Educational Resources & Information</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Trans Student Resources</h3>
                  <p className="text-sm text-muted-foreground">Resources for Trans Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer Note */}
        <section className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            This resource collection is regularly updated and maintained. If you know of additional resources that should be included, please reach out to contribute.
          </p>
        </section>
      </div>
    </div>
  )
} 