import apiClient from "../client"
import {
  Announcement,
  EventItem,
  Material,
  SemesterUpdatePayload,
  User
} from "@/types"

export const memberApi = {
  updateSemester: (payload: SemesterUpdatePayload) =>
    apiClient.put<User>("/api/members/update-semester", payload).then((r) => r.data),

  getAnnouncements: (limit = 3) =>
    apiClient
      .get<Announcement[]>("/api/announcements", { params: { limit } })
      .then((r) => r.data),

  getEvents: (limit = 3) =>
    apiClient.get<EventItem[]>("/api/events", { params: { limit } }).then((r) => r.data),

  getMaterials: () => apiClient.get<Material[]>("/api/materials").then((r) => r.data)
}
