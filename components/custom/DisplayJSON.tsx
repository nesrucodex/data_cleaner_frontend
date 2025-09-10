"use client"

import { CopyIcon, CheckIcon, SquareArrowOutUpRight, Minus } from "lucide-react"
import React, { useEffect, useState } from "react"
import Prism from "prismjs"
import "prismjs/components/prism-json"
import "prismjs/themes/prism.css"
import useClipboard from "@/hooks/useClipboard"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionItem } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface DisplayJSONProps {
  data: unknown
  label?: string
  defaultValue?: string
  withCopyButton?: boolean
  position?: { x?: string; y?: string } // e.g., 'bottom', 'right'
  buttonSize?: number
}

const DisplayJSON: React.FC<DisplayJSONProps> = ({
  data,
  label = "JSON Data",
  defaultValue = "No data provided",
  withCopyButton = true,
  position = { x: "right", y: "bottom" },
  buttonSize = 48,
}) => {
  const clipboard = useClipboard()
  const [opened, setOpened] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Format JSON safely
  const formattedData = React.useMemo(() => {
    if (data === null || data === undefined) return defaultValue
    try {
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error("Failed to stringify JSON:", error)
      return `Failed to display data: ${error instanceof Error ? error.message : String(error)}`
    }
  }, [data, defaultValue])

  const handleCopy = () => {
    clipboard.copy(formattedData)
  }

  // Initialize Prism after mount
  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      Prism.highlightAll()
    }
  }, [])

  // Positioning styles
  const isRight = position.x === "right"
  const isBottom = position.y === "bottom"

  return (
    <TooltipProvider>
      {/* Floating Button */}
      <div className={cn("fixed z-[1000]", isRight ? "right-4" : "left-4", isBottom ? "bottom-4" : "top-4")}>
        <Button
          onClick={() => setOpened((o) => !o)}
          size="icon"
          className={cn(
            "rounded-full shadow-lg transition-transform duration-200 ease-in-out hover:scale-105",
            "bg-primary hover:bg-primary/90",
          )}
          style={{ width: buttonSize, height: buttonSize }}
          aria-label={opened ? "Close JSON viewer" : "Open JSON viewer"}
        >
          {opened ? <Minus size={20} /> : <SquareArrowOutUpRight size={20} />}
        </Button>
      </div>

      {/* Sliding Panel */}
      <div
        className={cn(
          "fixed z-[999] transition-all duration-200 ease-in-out",
          isRight ? "right-4" : "left-4",
          "w-[calc(100vw-2rem)] max-w-[400px]",
          opened
            ? `${isBottom ? "bottom-20" : "top-20"} opacity-100 translate-y-0`
            : `${isBottom ? "bottom-16" : "top-16"} opacity-0 translate-y-4 pointer-events-none`,
        )}
        style={{
          [isBottom ? "bottom" : "top"]: buttonSize + 24,
        }}
      >
        <div className="bg-background border rounded-lg shadow-lg overflow-hidden">
          <Accordion type="single" value={opened ? "json" : undefined} className="w-full">
            <AccordionItem value="json" className="border-none">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="font-medium text-sm flex-1">{label}</span>
                {withCopyButton && mounted && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy()
                        }}
                        variant="ghost"
                        size="sm"
                        className={cn("h-8 w-8 p-0", clipboard.copied ? "text-green-600" : "text-muted-foreground")}
                      >
                        {clipboard.copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{clipboard.copied ? "Copied!" : "Copy to clipboard"}</TooltipContent>
                  </Tooltip>
                )}
              </div>

              <div className="max-h-[50vh] overflow-y-auto bg-muted/30 text-xs">
                <pre className="m-0 p-3 whitespace-pre-wrap break-words">
                  <code className="language-json">{formattedData}</code>
                </pre>
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default DisplayJSON
