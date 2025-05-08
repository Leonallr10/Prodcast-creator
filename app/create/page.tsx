// app/create/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Save, Sparkles, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScriptEditor } from "@/components/script-editor"
import { AudioPlayer } from "@/components/audio-player"
import { ScriptMetrics } from "@/components/script-metrics"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast" // Import the toast hook

type WorkflowState = "idle" | "loading-script" | "script-ready" | "loading-audio" | "audio-ready"

export default function CreatePodcast() {
  const router = useRouter()
  const { toast } = useToast() // Initialize the toast hook

  const [topic, setTopic] = useState("")
  const [script, setScript] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [state, setState] = useState<WorkflowState>("idle")
  const [isSaved, setIsSaved] = useState(false)

  const handleGenerateScript = async () => {
    if (!topic.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a topic to generate the script.",
        variant: "destructive",
      });
      return;
    }

    setState("loading-script")
    setIsSaved(false) // Reset saved state on regeneration
    setScript("") // Clear previous script
    setAudioUrl("") // Clear previous audio

    try {
        const response = await fetch('/api/generate-script', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch script from API');
        }

        setScript(data.script);
        setState("script-ready");

    } catch (error: any) {
        console.error("Script generation error:", error);
        toast({
            title: "Script Generation Failed",
            description: error.message || "An error occurred while generating the script.",
            variant: "destructive",
        });
        setState("idle"); // Go back to idle or an error state
        setScript(""); // Clear script on error
    }
  }

  const handleGenerateAudio = async () => {
    if (!script.trim()) {
        toast({
            title: "Script missing",
            description: "Please generate or write a script first.",
            variant: "destructive",
        });
        return;
    }

    setState("loading-audio")
    setAudioUrl("") // Clear previous audio

    try {
        const response = await fetch('/api/generate-audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ script }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch audio from API');
        }

        setAudioUrl(data.audioUrl);
        setState("audio-ready");
        toast({
          title: "Audio Generated!",
          description: "Your podcast audio is ready.",
        });

    } catch (error: any) {
        console.error("Audio generation error:", error);
        toast({
            title: "Audio Generation Failed",
            description: error.message || "An error occurred while generating the audio.",
            variant: "destructive",
        });
        setState("script-ready"); // Go back to script state on error
        setAudioUrl(""); // Clear audio on error
    }
  }

  const handleSavePodcast = () => {
    // In a real app, this would save the podcast to a database
    // along with the generated script and audioUrl.
    // For this example, we'll just simulate saving and navigate.

    if (state !== "audio-ready") {
       toast({
          title: "Cannot Save",
          description: "Please generate audio before saving.",
          variant: "destructive",
        });
       return;
    }

    setIsSaved(true);
    toast({
        title: "Podcast Saved!",
        description: "Redirecting to dashboard...",
        variant: "default", // Or a success variant if available
    });

    // Simulate saving time and then redirect
    setTimeout(() => {
      // In a real app, you'd likely pass the podcast ID after saving
      router.push("/dashboard");
    }, 1500);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="hidden md:flex">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="font-semibold">Create Your Podcast</h1>
            {state !== "idle" && (
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                {state === "loading-script"
                  ? "Generating Script..."
                  : state === "script-ready"
                    ? "Script Ready"
                    : state === "loading-audio"
                      ? "Generating Audio..."
                      : "Audio Ready"}
              </Badge>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSavePodcast}
                  disabled={state !== "audio-ready" || isSaved}
                  variant="outline"
                  className="gap-2"
                >
                  {isSaved ? (
                    <>
                      <Sparkles className="h-4 w-4 text-green-500" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save to Dashboard
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {state !== "audio-ready"
                  ? "Generate audio first to save your podcast"
                  : "Save this podcast to your dashboard"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* Step indicator */}
          <div className="flex justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                   // Step 1 active when idle or generating script
                   state === "idle" || state === "loading-script"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/50 text-primary-foreground/80" // Show completed step slightly differently
                }`}
              >
                1
              </div>
              <span className="text-xs mt-1">Topic</span>
            </div>
            <div className="flex-1 flex items-center px-2">
              <div
                className={`h-1 w-full rounded-full ${
                   // Connector active when past step 1
                   state !== "idle" ? "bg-primary" : "bg-muted"
                } transition-all duration-500`}
              ></div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  // Step 2 active when script ready or loading/ready audio
                  state === "script-ready" ||
                  state === "loading-audio" ||
                  state === "audio-ready"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="text-xs mt-1">Script</span>
            </div>
            <div className="flex-1 flex items-center px-2">
              <div
                className={`h-1 w-full rounded-full ${
                  // Connector active when past step 2
                  state === "loading-audio" || state === "audio-ready" ? "bg-primary" : "bg-muted"
                } transition-all duration-500`}
              ></div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  // Step 3 active when audio ready
                  state === "audio-ready" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className="text-xs mt-1">Audio</span>
            </div>
          </div>

          {/* Topic input */}
          {state === "idle" && (
            <Card className="overflow-hidden border-2 border-border shadow-lg">
              <div className="bg-primary/5 px-6 py-3 border-b">
                <h2 className="text-lg font-semibold">What's your podcast about?</h2>
              </div>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Enter a topic or sentence, and we'll generate a professional podcast script for you.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="E.g., The future of artificial intelligence"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="flex-1"
                      disabled={state === 'loading-script' || state === 'loading-audio'} // Disable input while loading
                    />
                    <Button onClick={handleGenerateScript} className="gap-2" disabled={state === 'loading-script' || state === 'loading-audio'}>
                      {state === 'loading-script' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {state === 'loading-script' ? 'Generating...' : 'Generate Script'}
                    </Button>
                  </div>
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Popular topics to try:</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Sustainable living",
                        "Digital marketing",
                        "Personal finance",
                        "Mental health",
                        "Travel tips",
                      ].map((suggestion) => (
                        <Badge
                          key={suggestion}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => setTopic(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading state (for both script and audio) */}
          {(state === "loading-script" || state === "loading-audio") && (
             <Card className="overflow-hidden border-2 border-border shadow-lg">
              <div className="bg-primary/5 px-6 py-3 border-b">
                <h2 className="text-lg font-semibold">
                  {state === "loading-script" ? "Generating your script..." : "Generating audio..."}
                </h2>
              </div>
              <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                  <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                </div>
                <h2 className="text-xl font-bold mt-6">
                  {state === "loading-script" ? "AI is working its magic" : "Creating your podcast audio"}
                </h2>
                <p className="text-muted-foreground mt-2 text-center max-w-md">
                  {state === "loading-script"
                    ? `Our AI is crafting a professional podcast script based on your topic "${topic}".`
                    : "Converting your script into high-quality audio with natural-sounding voices."}
                </p>
                {state === "loading-audio" && (
                   <>
                     <div className="w-full max-w-md mt-8 bg-muted rounded-full h-2 overflow-hidden">
                       {/* Simple pulsing animation for progress hint */}
                       <div className="bg-primary h-full w-1/2 animate-pulse"></div>
                     </div>
                     <p className="text-xs text-muted-foreground mt-2">This may take a minute or two</p>
                   </>
                )}
                {state === "loading-script" && (
                   <div className="mt-8 flex flex-wrap justify-center gap-3">
                     {/* You could add more specific loading hints here */}
                     <Badge variant="outline" className="bg-primary/5 py-1.5">
                        Processing Request
                     </Badge>
                      <Badge variant="outline" className="bg-primary/5 py-1.5 animation-delay-300">
                        Analyzing Topic
                     </Badge>
                      <Badge variant="outline" className="bg-primary/5 py-1.5 animation-delay-500">
                        Generating Content
                     </Badge>
                   </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Script ready state */}
          {(state === "script-ready" || state === "loading-audio" || state === "audio-ready") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Your Podcast Script</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleGenerateScript} disabled={state === "loading-audio" || state === "loading-script"}>
                    {state === 'loading-script' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Regenerate
                  </Button>
                  {state === "script-ready" && (
                    <Button onClick={handleGenerateAudio} className="gap-2" disabled={state === 'loading-audio' || !script.trim()}>
                       {state === 'loading-audio' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                       {state === 'loading-audio' ? 'Generating...' : 'Generate Audio'}
                    </Button>
                  )}
                   {/* Show Generate Audio button even in audio-ready state for easy re-generation */}
                   {state === "audio-ready" && (
                    <Button onClick={handleGenerateAudio} className="gap-2" disabled={state === 'loading-audio' || !script.trim()}>
                       {state === 'loading-audio' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                       Regenerate Audio
                    </Button>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  {/* Pass disabled state to ScriptEditor */}
                  <ScriptEditor value={script} onChange={setScript} disabled={state === "loading-audio" || state === "loading-script"} />
                </div>
                <div className="md:col-span-1">
                  <ScriptMetrics script={script} />
                </div>
              </div>
            </div>
          )}

          {/* Audio ready state */}
          {state === "audio-ready" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Podcast Audio</h2>
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  Ready to download
                </Badge>
              </div>
              {/* Use the dynamic audioUrl */}
              <AudioPlayer audioUrl={audioUrl} title={topic} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}