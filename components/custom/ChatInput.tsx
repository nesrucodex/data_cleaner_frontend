"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send, Mic } from "lucide-react"

export default function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (!message.trim()) return
    onSend(message.trim())
    setMessage("")
  }

  return (
    <div className="w-full border-t bg-white dark:bg-neutral-900 px-3 py-2">
      <div className="flex items-center gap-2">
        {/* Attachments */}
        <Button variant="ghost" size="icon" className="rounded-full">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Input field */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 rounded-full px-4 py-2 border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        {/* Mic button (optional) */}
        <Button variant="ghost" size="icon" className="rounded-full">
          <Mic className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Send button */}
        <Button
          size="icon"
          className="rounded-full bg-primary text-white"
          onClick={handleSend}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
