"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScriptEditor } from "@/components/script-editor"
import { AudioPlayer } from "@/components/audio-player"
import { ScriptMetrics } from "@/components/script-metrics"
import { ArrowLeft, Download, Pencil, Share2, Trash2 } from "lucide-react"
import { podcasts } from "@/lib/data"
import { formatDistanceToNow } from "date-fns"

export default function PodcastDetails() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const podcast = podcasts.find((p) => p.id === id)

  const [activeTab, setActiveTab] = useState("audio")
  const [script, setScript] = useState(podcast?.script || "")

  if (!podcast) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Podcast not found</h1>
        <p className="text-muted-foreground mb-6">The podcast you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  const handleDelete = () => {
    // In a real app, this would delete from a database
    router.push("/dashboard")
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild className="p-0">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <span className="text-muted-foreground">
              Created {formatDistanceToNow(new Date(podcast.createdAt), { addSuffix: true })}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{podcast.title}</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-red-500 hover:text-red-600" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="audio" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
        </TabsList>

        <TabsContent value="audio" className="mt-6">
          <Card className="p-6">
            <AudioPlayer url={podcast.audioUrl} title={podcast.title} className="mb-6" />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("script")} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Script
              </Button>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Download Audio
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="script" className="mt-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Script</h2>
              <ScriptMetrics script={script} />
            </div>

            <ScriptEditor value={script} onChange={setScript} className="min-h-[400px] mb-4" />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("audio")}>
                Back to Audio
              </Button>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
