import apiClient from "../client"
import {
  Announcement,
  EventItem,
  Material,
  PaginatedResponse,
  SemesterUpdatePayload,
  User
} from "@/types"

export const memberApi = {
  updateSemester: (payload: SemesterUpdatePayload) =>
    apiClient.put<User>("/api/members/update-semester", payload).then((r) => r.data),

  getAnnouncements: (limit = 10, page = 0) =>
    apiClient
      .get<PaginatedResponse<Announcement>>("/api/announcements", { params: { limit, page } })
      .then((r) => r.data),

  getEvents: (limit = 10, page = 0) =>
    apiClient.get<PaginatedResponse<EventItem>>("/api/events", { params: { limit, page } }).then((r) => r.data),

  getMaterials: (limit = 10, page = 0) =>
    apiClient.get<PaginatedResponse<Material>>("/api/materials", { params: { limit, page } }).then((r) => r.data)
}
