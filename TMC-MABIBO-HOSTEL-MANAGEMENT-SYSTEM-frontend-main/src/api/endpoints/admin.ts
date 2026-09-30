import apiClient from "../client"
import { AlumniRecord, PaginatedResponse, User } from "@/types"

export const leaderApi = {
  getActiveCount: () =>
    apiClient.get<{ count: number }>("/api/leaders/active-count").then((r) => r.data),

  uploadMaterial: (payload: { title: string; description: string; type: string; fileUrl: string }) =>
    apiClient.post("/api/leader/materials", payload).then((r) => r.data),

  postAnnouncement: (payload: {
    title: string
    content: string
  }) => apiClient.post("/api/leader/announcements", payload).then((r) => r.data),

  createEvent: (payload: {
    title: string
    description: string
    startsAt: string
    location: string
  }) => apiClient.post("/api/leader/events", payload).then((r) => r.data)
}

export const adminApi = {
  getMembers: (page = 0, size = 10) =>
    apiClient
      .get<PaginatedResponse<User>>("/api/admin/members", { params: { page, size } })
      .then((r) => r.data),

  promoteDemote: (id: number, role: string) =>
    apiClient.put(`/api/admin/members/${id}/role`, { role }).then((r) => r.data),

  baptize: (id: number, payload: { baptismDate?: string; churchName?: string; notes?: string } = {}) =>
    apiClient.put(`/api/admin/members/${id}/baptize`, payload).then((r) => r.data),

  graduate: (id: number) =>
    apiClient.post(`/api/admin/members/${id}/graduate`).then((r) => r.data),

  searchAlumni: (query: string) =>
    apiClient
      .get<PaginatedResponse<AlumniRecord>>("/api/admin/alumni", { params: { name: query } })
      .then((r) => r.data),

  getAnalytics: () =>
    apiClient
      .get<{
        totalMembers: number
        activeMembers: number
        alumniCount: number
        suspendedCount: number
        baptizedCount: number
        pendingReports: number
        pendingFeesCount: number
        membersByRole: Record<string, number>
        membersByYear: Record<string, number>
      }>("/api/admin/dashboard/stats")
      .then((r) => r.data)
}
