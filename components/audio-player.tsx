// components/audio-player.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Download, Pause, Play, SkipBack, SkipForward, Volume2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
// import { useToast } from "@/hooks/use-toast" // Uncomment if you want to use toasts here

interface AudioPlayerProps {
  audioUrl: string
  title?: string
  className?: string
}

export function AudioPlayer({ audioUrl, title, className = "" }: AudioPlayerProps) {
  // const { toast } = useToast(); // Uncomment if you want to use toasts here

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isAudioLoading, setIsAudioLoading] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null); // State to store audio errors

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    console.log("AudioPlayer useEffect running", { audioUrl });
    const audio = audioRef.current
    if (!audio) {
        console.log("Audio element not available in useEffect");
        return;
    }

    // Reset states when audioUrl changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioError(null);
    setIsAudioLoading(true);

    const setAudioData = () => {
      console.log("loadedmetadata event fired");
      setDuration(audio.duration)
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      console.log("ended event fired");
      setIsPlaying(false);
      setCurrentTime(0);
      setIsAudioLoading(false);
    }

    const handlePlay = () => {
      console.log("play event fired");
      setIsPlaying(true);
      setIsAudioLoading(false);
    }

    const handlePause = () => {
      console.log("pause event fired");
      setIsPlaying(false);
    }

    const handleCanPlayThrough = () => {
      console.log("canplaythrough event fired");
      setIsAudioLoading(false);
    }

    const handleWaiting = () => {
      console.log("waiting event fired (buffering)");
      setIsAudioLoading(true);
    }

    const handlePlaying = () => {
      console.log("playing event fired (resumed)");
      setIsAudioLoading(false);
    }

    const handleError = (e: Event) => {
      console.error("Audio playback error:", e);
      setIsAudioLoading(false);
      setAudioError("Failed to load audio.");
    }

    // Add event listeners
    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Cleanup
    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    }
  }, [audioUrl]);

  // Effect to set volume initially and when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl || audioError) {
      return;
    }

    try {
      if (isPlaying) {
        console.log("Attempting to pause audio");
        audioRef.current.pause();
        // Force pause state update
        setIsPlaying(false);
      } else {
        console.log("Attempting to play audio");
        audioRef.current.play();
        // Play state will be updated by the play event listener
      }
    } catch (error) {
      console.error("Error in togglePlay:", error);
      setIsPlaying(false);
    }
  }

  // Add a direct pause handler
  const handlePause = () => {
    console.log("Pause event fired");
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }

  // Handle time change
  const handleTimeChange = (value: number[]) => {
    if (!audioRef.current || isAudioLoading || duration === 0 || audioError) return

    console.log("Seeking audio to:", value[0]);
    audioRef.current.currentTime = value[0]
    setCurrentTime(value[0]) // Optimistic update
  }

  // Skip forward/backward
  const skipTime = (seconds: number) => {
    if (!audioRef.current || isAudioLoading || duration === 0 || audioError) return

    console.log(`Skipping audio by ${seconds} seconds`);
    audioRef.current.currentTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration)
     // currentTime will be updated by the timeupdate event
  }

  // Format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Check if controls should be disabled
  const controlsDisabled = isAudioLoading || !audioUrl || duration === 0 || !!audioError;


  return (
    <Card className={cn("overflow-hidden border-2 shadow-sm", className)}>
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-8 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center">
              <Button
                variant="default"
                size="icon"
                className="h-16 w-16 rounded-full shadow-lg"
                onClick={togglePlay}
                disabled={controlsDisabled}
              >
                 {isAudioLoading && !audioError ? (
                   <Loader2 className="h-8 w-8 animate-spin" />
                 ) : isPlaying ? (
                    <Pause className="h-8 w-8" />
                 ) : (
                    <Play className="h-8 w-8 ml-1" />
                 )}
              </Button>
            </div>
          </div>
          {/* Pulsing animation only when audio is playing and not loading */}
          {!controlsDisabled && isPlaying && (
            <>
              <span className="absolute -top-1 -left-1 w-26 h-26 rounded-full border-2 border-primary/20 animate-ping"></span>
              <span className="absolute -top-2 -left-2 w-28 h-28 rounded-full border-2 border-primary/10 animate-ping animation-delay-300"></span>
            </>
          )}
        </div>
      </div>
      <CardContent className="p-6">
         {audioError && (
             <div className="text-center text-destructive mb-4">
                 {audioError}
             </div>
         )}

        {/* Ensure the audio element uses the dynamic audioUrl */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {title && <h3 className="font-medium text-lg truncate mb-4">{title}</h3>}

        <div className="space-y-6">
          {/* Time slider */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-12">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={duration || 0.1} // Set a small max value if duration is 0 to avoid slider errors
                step={0.1}
                onValueChange={handleTimeChange}
                className="flex-1"
                disabled={controlsDisabled}
              />
              <span className="text-sm text-muted-foreground w-12 text-right">{formatTime(duration)}</span>
            </div>

            {/* Waveform visualization (simulated) - disable/grey out if loading or error */}
            <div className={cn("h-8 w-full flex items-center justify-center gap-0.5", controlsDisabled && "opacity-50")}>
              {Array.from({ length: 40 }).map((_, i) => {
                // Make waveform segments active only when playing and not disabled
                const isActive = (i / 40) * duration <= currentTime && isPlaying && !controlsDisabled;
                const height = Math.sin(i * 0.5) * 20 + 30
                return (
                  <div
                    key={i}
                    className={cn(`w-1 rounded-full`, isActive ? "bg-primary" : "bg-muted")}
                    style={{ height: `${height}%` }}
                  ></div>
                )
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <Button variant="outline" size="icon" onClick={() => skipTime(-10)} className="h-10 w-10 rounded-full" disabled={controlsDisabled}>
              <SkipBack className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 w-1/2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                 value={[volume]}
                 max={100}
                 step={1}
                 onValueChange={(value) => setVolume(value[0])}
                 disabled={controlsDisabled}
             />
            </div>

            <Button variant="outline" size="icon" onClick={() => skipTime(10)} className="h-10 w-10 rounded-full" disabled={controlsDisabled}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Download button - Use a standard <a> tag for direct download */}
          {audioUrl && !isAudioLoading && !audioError && ( // Only show download button if audioUrl is available, not loading, and no error
             <a href={audioUrl} download={`${title || 'podcast'}.mp3`} className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground", // Use outline button styles
                "h-10 px-4 py-2 w-full" // Full width
             )}>
              <Download className="h-4 w-4 mr-2" />
              Download Audio
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}