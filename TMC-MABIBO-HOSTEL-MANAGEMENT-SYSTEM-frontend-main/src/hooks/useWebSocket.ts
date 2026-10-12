import { useCallback, useEffect, useRef, useState } from "react"
import { Client, IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { ChatMessage } from "@/types"
import { chatApi } from "@/api/endpoints/chat"

const WS_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:8080"}/ws`
const MAX_MESSAGES = 200

export function useWebSocket(username: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!username) return

    // Load persisted history first so refreshes keep past messages.
    chatApi
      .getMessages("public", 100)
      .then((history) => setMessages(history.slice(-100)))
      .catch(() => {
        // history is best-effort; live subscription still works
      })

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as unknown as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("tucasa_token") ?? ""}`
      },
      reconnectDelay: 4000,
      onConnect: () => {
        setConnected(true)
        client.subscribe("/topic/public", (frame: IMessage) => {
          try {
            const body: ChatMessage = JSON.parse(frame.body)
            // Skip frames already present from history (same persisted id).
            setMessages((prev) => {
              const exists = body.id != null && prev.some((m) => m.id === body.id)
              if (exists) return prev
              const updated = [...prev, body]
              // Limit message history to prevent memory issues
              return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated
            })
          } catch {
            // ignore malformed frames
          }
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false)
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [username])

  const sendMessage = useCallback(
    (content: string) => {
      if (!clientRef.current?.connected || !username || !content.trim()) return
      clientRef.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify({
          roomId: "public",
          message: content
        })
      })
    },
    [username]
  )

  return { messages, connected, sendMessage }
}
