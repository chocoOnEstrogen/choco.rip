"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Copy, RefreshCw, ExternalLink, ChevronRight } from "lucide-react"

export default function DiscordProfileGenerator() {
  const [userId, setUserId] = useState("")
  const [profileCard, setProfileCard] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [cardType, setCardType] = useState("short")

  const generateProfileCard = async () => {
    if (!userId) {
      toast.error("Please enter a Discord user ID")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/discord-profile?id=${userId}&type=${cardType}`)
      if (!response.ok) {
        throw new Error("Failed to generate profile card")
      }
      
      const svgText = await response.text()
      setProfileCard(svgText)
      setActiveTab("preview")
    } catch (error) {
      console.error("Error generating profile card:", error)
      toast.error("Failed to generate profile card. Please check the user ID and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyEmbedCode = () => {
    if (!userId) return
    
    const embedCode = `<img src="${window.location.origin}/discord-profile?id=${userId}&type=${cardType}" alt="Discord Profile Card" />`
    navigator.clipboard.writeText(embedCode)
    toast.success("Embed code copied to clipboard!")
  }

  const copyDirectLink = () => {
    if (!userId) return
    
    const directLink = `${window.location.origin}/discord-profile?id=${userId}&type=${cardType}`
    navigator.clipboard.writeText(directLink)
    toast.success("Direct link copied to clipboard!")
  }

  const openDiscordProfile = () => {
    if (!userId) return
    window.open(`https://discord.com/users/${userId}`, "_blank")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="border-pink-100 dark:border-pink-900/30">
        <CardHeader>
          <CardTitle className="text-pink-700 dark:text-pink-300">Generate Profile Card</CardTitle>
          <CardDescription>
            Enter a Discord user ID to generate a profile card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="userId" className="text-sm font-medium">
                Discord User ID
              </label>
              <Input
                id="userId"
                placeholder="Enter Discord user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="border-pink-200 dark:border-pink-800"
              />
              <p className="text-xs text-muted-foreground">
                You can find your Discord user ID by enabling Developer Mode in Discord settings and right-clicking your profile.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Card Type
              </label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="w-full rounded-md border border-pink-200 dark:border-pink-800 bg-background px-3 py-2 text-sm"
              >
                <option value="short">Short Card</option>
                <option value="normal">Normal Card</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {cardType === "short" 
                  ? "A compact card showing basic user information." 
                  : "A larger card with more details including Spotify activity (if available)."}
              </p>
            </div>
            
            <Button 
              onClick={generateProfileCard} 
              disabled={isLoading || !userId}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Profile Card"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-pink-100 dark:border-pink-900/30">
        <CardHeader>
          <CardTitle className="text-pink-700 dark:text-pink-300">Profile Card</CardTitle>
          <CardDescription>
            {profileCard ? "Your generated profile card" : "Generate a profile card to see it here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profileCard ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="embed">Embed Code</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="mt-4">
                <div className="flex justify-center p-4 bg-gray-900 rounded-lg">
                    <div className={`max-w-full ${cardType === 'normal' ? 'scale-75' : ''}`} dangerouslySetInnerHTML={{ __html: profileCard }} />
                </div>
              </TabsContent>
              <TabsContent value="embed" className="mt-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    {`<img src="${window.location.origin}/discord-profile?id=${userId}&type=${cardType}" alt="Discord Profile Card" />`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-40 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-muted-foreground">No profile card generated yet</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyEmbedCode}
            disabled={!profileCard}
            className="border-pink-200 dark:border-pink-800"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Embed Code
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyDirectLink}
            disabled={!profileCard}
            className="border-pink-200 dark:border-pink-800"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Direct Link
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openDiscordProfile}
            disabled={!userId}
            className="border-pink-200 dark:border-pink-800"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Discord Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 