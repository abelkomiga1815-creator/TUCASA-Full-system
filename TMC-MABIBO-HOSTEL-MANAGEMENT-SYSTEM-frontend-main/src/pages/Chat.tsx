import { FormEvent, useEffect, useRef, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useWebSocket } from "@/hooks/useWebSocket"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { imageUrl } from "@/utils/imageUrl"
import { cn } from "@/utils/cn"

export default function Chat() {
  const { user } = useAuth()
  const { messages, connected, sendMessage } = useWebSocket(user?.email)
  const [draft, setDraft] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    sendMessage(draft)
    setDraft("")
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 py-4 pb-24 sm:pb-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Community chat</h1>
        <span
          className={cn(
            "text-xs font-medium",
            connected ? "text-success" : "text-muted-foreground"
          )}
        >
          {connected ? "Connected" : "Connecting..."}
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border bg-card p-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No messages yet. Say hello!</p>
        ) : (
          messages.map((m, i) => {
            const isMe = m.senderId === user?.id
            return (
              <div key={m.id ?? i} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                {!isMe && (
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={imageUrl(m.senderProfilePicUrl)} alt={m.senderName} />
                    <AvatarFallback className="text-[10px]">
                      {m.senderName?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                    isMe ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {!isMe && <p className="mb-0.5 text-xs font-medium opacity-80">{m.senderName}</p>}
                  <p>{m.message}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" disabled={!connected}>
          Send
        </Button>
      </form>
    </div>
  )
}
