"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Trash2, Download, Upload, Settings, AlertCircle, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type IDFormat = "decimal" | "hex" | "binary"
type TokenMetadata = {
  userId?: string
  role?: string
  message?: string
  [key: string]: any
}

const EPOCH = 1420070400000 // 2015-01-01T00:00:00.000Z
const TIMESTAMP_BITS = 42
const WORKER_ID_BITS = 10
const SEQUENCE_BITS = 12
const MAX_WORKER_ID = (1 << WORKER_ID_BITS) - 1 // 1023
const MAX_SEQUENCE = (1 << SEQUENCE_BITS) - 1 // 4095

export default function HelixDemo() {
  const [ids, setIds] = useState<bigint[]>([])
  const [tokens, setTokens] = useState<string[]>([])
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({})
  const [decodedData, setDecodedData] = useState<{
    id?: { timestamp: string; workerId: number; sequence: number }
    token?: any
  }>({})
  const [workerId, setWorkerId] = useState<string>("")
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata>({
    userId: "123",
    role: "admin",
    message: "Hello from Helix!",
  })
  const [idFormat, setIdFormat] = useState<IDFormat>("decimal")
  const [batchSize, setBatchSize] = useState<string>("1")
  const [showSettings, setShowSettings] = useState(false)
  const [customMetadata, setCustomMetadata] = useState<string>("")
  const [validationToken, setValidationToken] = useState<string>("")
  const [showSpecs, setShowSpecs] = useState(false)

  const formatId = (id: bigint) => {
    switch (idFormat) {
      case "hex":
        return `0x${id.toString(16)}`
      case "binary":
        return `0b${id.toString(2)}`
      default:
        return id.toString()
    }
  }

  const callHelixApi = async (operation: string, data: any) => {
    try {
      const response = await fetch("/api/helix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ operation, data }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to perform operation")
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  const generateId = async () => {
    try {
      const { id } = await callHelixApi("generateId", { workerId })
      setIds((prev) => [...prev, BigInt(id)])
      toast.success("ID generated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate ID")
    }
  }

  const generateBatchIds = async () => {
    try {
      const size = parseInt(batchSize) || 1
      const { ids: newIds } = await callHelixApi("generateBatchIds", { workerId, size })
      setIds((prev) => [...prev, ...newIds.map((id: string) => BigInt(id))])
      toast.success(`Generated ${size} IDs successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate batch IDs")
    }
  }

  const generateToken = async () => {
    try {
      let metadata = { ...tokenMetadata }
      if (customMetadata) {
        try {
          const custom = JSON.parse(customMetadata)
          metadata = { ...metadata, ...custom }
        } catch (error) {
          toast.error("Invalid custom metadata JSON")
          return
        }
      }
      const { token } = await callHelixApi("generateToken", { workerId, metadata })
      setTokens((prev) => [...prev, token])
      toast.success("Token generated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate token")
    }
  }

  const validateToken = async () => {
    try {
      const { valid, decoded } = await callHelixApi("validateToken", { token: validationToken })
      if (valid) {
        toast.success("Token is valid", {
          description: JSON.stringify(decoded, null, 2),
        })
      } else {
        toast.error("Invalid token")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to validate token")
    }
  }

  const decodeId = async (id: bigint) => {
    try {
      const decoded = await callHelixApi("decodeId", { id: id.toString() })
      setDecodedData((prev) => ({ ...prev, id: decoded }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to decode ID")
    }
  }

  const decodeToken = async (token: string) => {
    try {
      const { decoded } = await callHelixApi("decodeToken", { token })
      setDecodedData((prev) => ({ ...prev, token: decoded }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to decode token")
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied((prev) => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }))
    }, 2000)
  }

  const clearAll = () => {
    setIds([])
    setTokens([])
    setDecodedData({})
    toast.success("Cleared all data")
  }

  const exportData = () => {
    const data = {
      ids: ids.map(id => id.toString()),
      tokens,
      workerId,
      tokenMetadata,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "helix-data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        setIds(data.ids.map((id: string) => BigInt(id)))
        setTokens(data.tokens)
        setWorkerId(data.workerId)
        setTokenMetadata(data.tokenMetadata)
        toast.success("Data imported successfully")
      } catch (error) {
        toast.error("Failed to import data")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Badge
              variant="outline"
              className="w-fit rounded-full px-4 py-1 text-sm bg-pink-100/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
            >
              Helix Demo
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Helix ID Generator
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Generate and decode unique IDs and tokens using the Helix algorithm.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="rounded-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showSettings ? "Hide Settings" : "Show Settings"}
          </Button>
          <Button
            onClick={() => setShowSpecs(!showSpecs)}
            variant="outline"
            className="rounded-full"
          >
            <Info className="w-4 h-4 mr-2" />
            {showSpecs ? "Hide Specs" : "Show Specs"}
          </Button>
          <Button
            onClick={clearAll}
            variant="outline"
            className="rounded-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button
            onClick={exportData}
            variant="outline"
            className="rounded-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <div className="relative">
            <Input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
              id="import-file"
            />
            <Label
              htmlFor="import-file"
              className="flex items-center justify-center h-10 px-4 py-2 rounded-full bg-pink-50 dark:bg-pink-900/10 hover:bg-pink-100 dark:hover:bg-pink-900/20 cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Label>
          </div>
        </div>

        {showSpecs && (
          <Card className="border-pink-100 dark:border-pink-900/30 shadow-lg">
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">ID Structure</h3>
                    <div className="bg-pink-50 dark:bg-pink-900/10 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded">
                          <div className="text-sm font-medium">Timestamp</div>
                          <div className="text-xs text-muted-foreground">{TIMESTAMP_BITS} bits</div>
                        </div>
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded">
                          <div className="text-sm font-medium">Worker ID</div>
                          <div className="text-xs text-muted-foreground">{WORKER_ID_BITS} bits</div>
                        </div>
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded">
                          <div className="text-sm font-medium">Sequence</div>
                          <div className="text-xs text-muted-foreground">{SEQUENCE_BITS} bits</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Limits</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Max Worker ID</span>
                        <code className="font-mono">{MAX_WORKER_ID}</code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Max Sequence</span>
                        <code className="font-mono">{MAX_SEQUENCE}</code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Epoch</span>
                        <code className="font-mono">2015-01-01T00:00:00.000Z</code>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Token Format</h3>
                    <div className="bg-pink-50 dark:bg-pink-900/10 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded">
                            <div className="text-sm font-medium">Version + Data</div>
                            <div className="text-xs text-muted-foreground">Base64URL encoded</div>
                          </div>
                          <div className="text-muted-foreground">+</div>
                          <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded">
                            <div className="text-sm font-medium">Entropy</div>
                            <div className="text-xs text-muted-foreground">Base64URL encoded</div>
                          </div>
                          <div className="text-muted-foreground">+</div>
                          <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded">
                            <div className="text-sm font-medium">HMAC Signature</div>
                            <div className="text-xs text-muted-foreground">Base64URL encoded</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>64-bit unique IDs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Time-ordered IDs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Distributed generation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Secure tokens with metadata</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showSettings && (
          <Card className="border-pink-100 dark:border-pink-900/30 shadow-lg">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Worker ID</Label>
                    <Input
                      type="number"
                      value={workerId}
                      onChange={(e) => setWorkerId(e.target.value)}
                      placeholder="Auto-generated if empty"
                      min="0"
                      max={MAX_WORKER_ID.toString()}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Range: 0-{MAX_WORKER_ID}
                    </p>
                  </div>
                  <div>
                    <Label>ID Format</Label>
                    <Tabs
                      value={idFormat}
                      onValueChange={(value) => setIdFormat(value as IDFormat)}
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="decimal">Decimal</TabsTrigger>
                        <TabsTrigger value="hex">Hex</TabsTrigger>
                        <TabsTrigger value="binary">Binary</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div>
                    <Label>Batch Size</Label>
                    <Input
                      type="number"
                      value={batchSize}
                      onChange={(e) => setBatchSize(e.target.value)}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Token Metadata</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="User ID"
                        value={tokenMetadata.userId}
                        onChange={(e) =>
                          setTokenMetadata((prev) => ({ ...prev, userId: e.target.value }))
                        }
                      />
                      <Input
                        placeholder="Role"
                        value={tokenMetadata.role}
                        onChange={(e) =>
                          setTokenMetadata((prev) => ({ ...prev, role: e.target.value }))
                        }
                      />
                      <Input
                        placeholder="Message"
                        value={tokenMetadata.message}
                        onChange={(e) =>
                          setTokenMetadata((prev) => ({ ...prev, message: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Custom Metadata (JSON)</Label>
                    <Textarea
                      value={customMetadata}
                      onChange={(e) => setCustomMetadata(e.target.value)}
                      placeholder='{"customField": "value"}'
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-pink-100 dark:border-pink-900/30 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Generate IDs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={generateId}
                    className="flex-1 rounded-full px-8 py-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Generate New ID
                  </Button>
                  <Button
                    onClick={generateBatchIds}
                    className="flex-1 rounded-full px-8 py-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Generate {batchSize} IDs
                  </Button>
                </div>
                {ids.length > 0 && (
                  <div className="space-y-2">
                    {ids.map((id, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10"
                      >
                        <code className="font-mono text-sm">{formatId(id)}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(formatId(id), `id-${index}`)}
                          className="h-8 w-8 p-0 hover:bg-pink-100 dark:hover:bg-pink-900/20"
                        >
                          {copied[`id-${index}`] ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100 dark:border-pink-900/30 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Generate Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={generateToken}
                  className="w-full rounded-full px-8 py-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Generate New Token
                </Button>
                {tokens.length > 0 && (
                  <div className="space-y-2">
                    {tokens.map((token, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10"
                      >
                        <code className="font-mono text-sm truncate">{token}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(token, `token-${index}`)}
                          className="h-8 w-8 p-0 hover:bg-pink-100 dark:hover:bg-pink-900/20"
                        >
                          {copied[`token-${index}`] ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-pink-100 dark:border-pink-900/30 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Decode ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ids.length > 0 && (
                  <div className="space-y-2">
                    {ids.map((id, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => decodeId(id)}
                        className="w-full justify-start p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10"
                      >
                        <code className="font-mono text-sm truncate">
                          Decode ID: {formatId(id)}
                        </code>
                      </Button>
                    ))}
                  </div>
                )}
                {decodedData.id && (
                  <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-900/10">
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground">Timestamp:</span>
                        <span className="ml-2 font-mono">
                          {decodedData.id.timestamp}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Worker ID:</span>
                        <span className="ml-2 font-mono">{decodedData.id.workerId}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sequence:</span>
                        <span className="ml-2 font-mono">{decodedData.id.sequence}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-100 dark:border-pink-900/30 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Validate & Decode Token
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={validationToken}
                    onChange={(e) => setValidationToken(e.target.value)}
                    placeholder="Enter token to validate"
                    className="font-mono"
                  />
                  <Button
                    onClick={validateToken}
                    className="w-full rounded-full px-8 py-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Validate Token
                  </Button>
                </div>
                {tokens.length > 0 && (
                  <div className="space-y-2">
                    {tokens.map((token, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => decodeToken(token)}
                        className="w-full justify-start p-3 rounded-lg bg-pink-50 dark:bg-pink-900/10"
                      >
                        <code className="font-mono text-sm truncate">
                          Decode Token: {token.slice(0, 20)}...
                        </code>
                      </Button>
                    ))}
                  </div>
                )}
                {decodedData.token && (
                  <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-900/10">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(decodedData.token, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 