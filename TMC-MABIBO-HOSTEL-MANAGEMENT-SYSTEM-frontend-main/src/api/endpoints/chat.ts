import apiClient from "../client"
import { ChatMessage } from "@/types"

export const chatApi = {
  getMessages: (room = "public", limit = 100) =>
    apiClient
      .get<ChatMessage[]>("/api/chat/messages", { params: { room, limit } })
      .then((r) => r.data),
}
