"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Clock, Headphones, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { podcasts } from "@/lib/data"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("all")

  const filteredPodcasts = activeTab === "all" ? podcasts : podcasts.filter((podcast) => podcast.status === activeTab)

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Podcasts</h1>
          <p className="text-muted-foreground mt-1">Manage and view all your podcast projects</p>
        </div>
        <Button asChild>
          <Link href="/create" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create New
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Podcasts</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredPodcasts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No podcasts found</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any {activeTab !== "all" ? activeTab : ""} podcasts yet.
          </p>
          <Button asChild>
            <Link href="/create">Create Your First Podcast</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPodcasts.map((podcast) => (
            <Card key={podcast.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="truncate">{podcast.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{podcast.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{podcast.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Headphones className="h-3 w-3" />
                    <span>{podcast.wordCount} words</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(podcast.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/podcast/${podcast.id}`}>
                    {podcast.status === "draft" ? "Continue Editing" : "View Podcast"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
