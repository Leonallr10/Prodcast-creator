"use client"

import type React from "react"

import { useState } from "react"
import { CheckCircle2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface ScriptEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

export function ScriptEditor({ value, onChange, className = "", disabled = false }: ScriptEditorProps) {
  const [selectedText, setSelectedText] = useState("")
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [grammarChecked, setGrammarChecked] = useState(false)

  const handleTextSelect = (e: React.MouseEvent<HTMLTextAreaElement> | React.TouchEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd

    if (start !== end) {
      setSelectedText(value.substring(start, end))
      setSelectionStart(start)
      setSelectionEnd(end)
    } else {
      setSelectedText("")
    }
  }

  const improveSelection = () => {
    if (!selectedText) return

    // Simulate AI improvement of the selected text
    const improved =
      selectedText.charAt(0).toUpperCase() + selectedText.slice(1) + " (enhanced with more engaging language)"

    const newScript = value.substring(0, selectionStart) + improved + value.substring(selectionEnd)
    onChange(newScript)
    setSelectedText("")
  }

  const checkGrammar = () => {
    // Simulate grammar check
    setGrammarChecked(true)
    setTimeout(() => {
      setGrammarChecked(false)
    }, 3000)
  }

  return (
    <Card className={`relative overflow-hidden border-2 shadow-sm ${className}`}>
      <div className="bg-card px-4 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Script Editor</span>
          {grammarChecked && (
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              No issues found
            </Badge>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={checkGrammar} className="h-8 text-xs gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Check Grammar
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseUp={handleTextSelect}
        onTouchEnd={handleTextSelect as any}
        className="min-h-[300px] font-medium resize-none p-4 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Your script will appear here..."
        disabled={disabled}
      />

      {selectedText && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="default" className="gap-1 shadow-lg">
                <Sparkles className="h-3.5 w-3.5" />
                Improve Selection
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Improve selected text</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI will enhance the selected text to make it more engaging and professional.
                </p>
                <div className="border rounded-md p-2 bg-muted text-sm">{selectedText}</div>
                <Button size="sm" onClick={improveSelection} className="w-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  Improve Text
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </Card>
  )
}
