import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, Mail, Globe, Calendar } from "lucide-react"
import Link from "next/link"
import config from "@/config"

export const metadata: Metadata = {
  title: "No Hello - Communication Guidelines",
  description: "Learn how to communicate effectively with me. Skip the small talk and get straight to the point for faster and more productive conversations.",
  keywords: "communication guidelines, no hello, effective communication, contact information, availability",
  icons: {
    icon: config.avatar,
    shortcut: config.avatar,
    apple: config.avatar,
  },
  openGraph: {
    title: "No Hello - Communication Guidelines",
    description: "Learn how to communicate effectively with me. Skip the small talk and get straight to the point for faster and more productive conversations.",
    type: "website",
    url: config.url + "/no-hello",
    images: [
      {
        url: config.url + "/images/bg.gif",
        width: 1200,
        height: 630,
        alt: "No Hello - Communication Guidelines",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "No Hello - Communication Guidelines",
    description: "Learn how to communicate effectively with me. Skip the small talk and get straight to the point for faster and more productive conversations.",
    images: [config.url + "/images/bg.gif"],
  },
  alternates: {
    canonical: config.url + "/no-hello",
  },
}

const dontDo = [
  "Hello",
  "Hi Selina",
  "Are you there?",
  "[Insert vague greeting here]",
]

const doThis = [
  "What you need: Describe your request or question",
  "Why you're reaching out: Provide context",
  "Any relevant links or attachments: If applicable",
]

const contactInfo = [
  {
    title: "Primary Email",
    value: "hello@choco.rip",
    icon: <Mail className="w-6 h-6" />,
  },
  {
    title: "Secondary Email",
    value: "choco@choco.rip",
    icon: <Mail className="w-6 h-6" />,
  },
  {
    title: "Time Zone",
    value: "Eastern Time (ET/UTC-5)",
    icon: <Clock className="w-6 h-6" />,
  },
  {
    title: "Working Hours",
    value: "Monday-Friday, 9:00-17:00 ET",
    icon: <Calendar className="w-6 h-6" />,
  },
]

export default function NoHelloPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-pink-50/50 dark:from-background dark:to-pink-950/10">
      <div className="container px-4 md:px-6 py-20 md:py-32">
        {/* Hero Section */}
        <section className="text-center py-12">
          <Badge
            variant="outline"
            className="w-fit mx-auto rounded-full px-4 py-1 text-sm bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1 text-pink-500" />
            <span>Communication Guidelines</span>
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Hi there! <span className="text-pink-500">👋</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            If you're reading this, you probably want to get in touch with me. That's great! However, to make our communication as efficient and productive as possible, I kindly ask you to follow these guidelines.
          </p>
        </section>

        {/* Why No Hello Section */}
        <section className="py-12">
          <Card className="border-pink-100 dark:border-pink-900/30">
            <CardHeader>
              <CardTitle className="text-pink-700 dark:text-pink-300">Why "No Hello"?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sending just "Hello" or "Hi" without context forces me to wait for you to explain why you're reaching out. This creates unnecessary back-and-forth and delays. Instead, get straight to the point so I can help you faster!
              </p>
            </CardContent>
          </Card>
        </section>

        {/* How to Message Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            How to Message Me
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-pink-100 dark:border-pink-900/30">
              <CardHeader>
                <CardTitle className="text-pink-700 dark:text-pink-300">Don't</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {dontDo.map((item, index) => (
                    <li key={index} className="text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-pink-100 dark:border-pink-900/30">
              <CardHeader>
                <CardTitle className="text-pink-700 dark:text-pink-300">Do</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Start with a clear and concise message that includes:
                </p>
                <ul className="space-y-2">
                  {doThis.map((item, index) => (
                    <li key={index} className="text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Example Section */}
        <section className="py-12">
          <Card className="border-pink-100 dark:border-pink-900/30">
            <CardHeader>
              <CardTitle className="text-pink-700 dark:text-pink-300">Example</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-pink-200 dark:border-pink-800 pl-4 italic text-muted-foreground">
                "Hi Selina, I'm working on [project] and need your input on [specific detail]. Here's a link to the document: [link]. Let me know if you need more info!"
              </blockquote>
            </CardContent>
          </Card>
        </section>

        {/* Contact Information Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Contact Information & Availability
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-pink-100 dark:border-pink-900/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {info.icon}
                    <CardTitle className="text-pink-700 dark:text-pink-300">{info.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{info.value}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Response Time Section */}
        <section className="py-12">
          <Card className="border-pink-100 dark:border-pink-900/30">
            <CardHeader>
              <CardTitle className="text-pink-700 dark:text-pink-300">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                I aim to respond within 24-48 business hours. Due to time zone differences, responses may be delayed for contacts outside of Eastern Time. For urgent matters, please indicate the time-sensitivity in your message.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Why This Matters Section */}
        <section className="py-12">
          <Card className="border-pink-100 dark:border-pink-900/30">
            <CardHeader>
              <CardTitle className="text-pink-700 dark:text-pink-300">Why This Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Efficient communication saves time for both of us and ensures I can address your needs promptly. By skipping the small talk and getting straight to the point, we can focus on what really matters.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Footer Note */}
        <section className="text-center py-8">
          <p className="text-muted-foreground">
            Thanks for understanding! Looking forward to hearing from you. 😊
          </p>
        </section>
      </div>
    </div>
  )
} 