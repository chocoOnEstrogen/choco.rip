import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import DiscordProfileGenerator from "@/components/discord-profile-generator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Discord Profile Card Generator",
  description: "Generate beautiful Discord profile cards for your website or social media profiles.",
  keywords: "discord, profile card, generator, embed, lanyard",
}

export default async function DiscordProfilePage() {
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'http'
    const origin = `${protocol}://${host}`

  return (
    <div className="container px-4 md:px-6 py-20 md:py-32">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Badge
              variant="outline"
              className="w-fit rounded-full px-4 py-1 text-sm bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
            >
              <span>Discord Profile Card Generator</span>
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Discord Profile Card Generator</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Generate beautiful Discord profile cards for your website or social media profiles. Powered by Lanyard API.
            </p>
          </div>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>
          <TabsContent value="generator">
            <DiscordProfileGenerator />
          </TabsContent>
          <TabsContent value="documentation">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Card Types</CardTitle>
                  <CardDescription>Different styles of Discord profile cards available</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">Short Card</h3>
                    <p className="text-muted-foreground">
                      A compact card showing basic user information including avatar, username, and online status.
                      Perfect for small spaces or sidebars.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Type: short</Badge>
                      <Badge variant="outline">Size: 340x120px</Badge>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">Normal Card</h3>
                    <p className="text-muted-foreground">
                      A larger card with more details including Spotify activity (if available), showing song progress,
                      album art, and more comprehensive user information.
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Type: normal</Badge>
                      <Badge variant="outline">Size: 600x400px</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>URL Parameters</CardTitle>
                  <CardDescription>Customize your Discord profile card with URL parameters</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">Required Parameters</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <code className="bg-muted px-1 py-0.5 rounded">id</code> - Your Discord user ID
                      </li>
                    </ul>
                  </div>
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">Optional Parameters</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <code className="bg-muted px-1 py-0.5 rounded">type</code> - Card type: "short" or "normal" (default: "short")
                      </li>
                      <li>
                        <code className="bg-muted px-1 py-0.5 rounded">redirect</code> - Set to "true" to redirect to the Discord profile page
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Example Usage</CardTitle>
                  <CardDescription>How to use the Discord profile card in your projects</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">HTML Embed</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                      <code>{`<img src="${origin}/discord-profile?id=YOUR_DISCORD_ID&type=normal" alt="Discord Profile" />`}</code>
                    </pre>
                  </div>
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">Markdown</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                      <code>{`![Discord Profile](${origin}/discord-profile?id=YOUR_DISCORD_ID&type=normal)`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}