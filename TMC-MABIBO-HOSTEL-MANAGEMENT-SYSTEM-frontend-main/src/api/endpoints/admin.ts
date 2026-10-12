import apiClient from "../client"
import { AlumniRecord, PaginatedResponse, User, UserResponse } from "@/types"

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
      .then((r) => r.data),

  adminResetPassword: (id: number, payload: { temporaryPassword: string; confirmTemporaryPassword: string }) =>
    apiClient.put<UserResponse>(`/api/admin/members/${id}/reset-password`, payload).then((r) => r.data),

  exportMembers: (memberIds: number[]) =>
    apiClient
      .post<Blob>(`/api/admin/members/export`, memberIds, {
        responseType: "arraybuffer",
        headers: { "Content-Type": "application/json" },
      })
      .then((r) => {
        const url = window.URL.createObjectURL(new Blob([r.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", "TUCASA_Member_Details_" + new Date().toISOString().split("T")[0] + ".xlsx")
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
        window.URL.revokeObjectURL(url)
      }),

  exportAllMembers: () =>
    apiClient
      .get<Blob>(`/api/admin/members/export/all`, {
        responseType: "arraybuffer",
        headers: { "Content-Type": "application/json" },
      })
      .then((r) => {
        const url = window.URL.createObjectURL(new Blob([r.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", "TUCASA_All_Members_" + new Date().toISOString().split("T")[0] + ".xlsx")
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
        window.URL.revokeObjectURL(url)
      }),
}
