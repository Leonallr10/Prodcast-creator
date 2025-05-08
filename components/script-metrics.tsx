import { Clock, FileText, BarChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScriptMetricsProps {
  script: string
}

export function ScriptMetrics({ script }: ScriptMetricsProps) {
  // Calculate word count
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0

  // Calculate estimated duration (average speaking rate is about 150 words per minute)
  const durationMinutes = Math.ceil(wordCount / 150)

  // Calculate reading difficulty (simplified Flesch-Kincaid)
  const sentences = script.split(/[.!?]+/).filter(Boolean).length || 1
  const avgWordsPerSentence = wordCount / sentences

  let readingLevel = "Easy"
  if (avgWordsPerSentence > 20) {
    readingLevel = "Advanced"
  } else if (avgWordsPerSentence > 14) {
    readingLevel = "Intermediate"
  }

  return (
    <Card className="border-2 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 bg-card px-4 py-2 border-b">
        <CardTitle className="text-sm font-medium">Script Metrics</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Word Count</p>
              <p className="text-xl font-bold">{wordCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Estimated Duration</p>
              <p className="text-xl font-bold">{durationMinutes} min</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Reading Level</p>
              <p className="text-xl font-bold">{readingLevel}</p>
              <p className="text-xs text-muted-foreground">Avg. {avgWordsPerSentence.toFixed(1)} words per sentence</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
