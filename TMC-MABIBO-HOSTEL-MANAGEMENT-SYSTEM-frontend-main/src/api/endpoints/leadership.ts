import apiClient from "../client"
import { Position, PositionRequest, Regime, RegimeRequest, Assignment, AssignmentRequest, User, PaginatedResponse, AboutUsResponse, AboutUsRequest } from "@/types"

export const leadershipApi = {
  // Public endpoints
  getCurrent: () => apiClient.get<Position[]>("/api/leadership/current").then((r) => r.data),
  getPast: () => apiClient.get<Regime[]>("/api/leadership/past").then((r) => r.data),

  // Admin positions
  getPositions: () => apiClient.get<Position[]>("/api/admin/positions").then((r) => r.data),
  createPosition: (data: PositionRequest) => apiClient.post<Position>("/api/admin/positions", data).then((r) => r.data),
  updatePosition: (id: number, data: PositionRequest) => apiClient.put<Position>(`/api/admin/positions/${id}`, data).then((r) => r.data),
  retirePosition: (id: number) => apiClient.delete(`/api/admin/positions/${id}`).then((r) => r.data),

  // Admin regimes
  getRegimes: () => apiClient.get<Regime[]>("/api/admin/regimes").then((r) => r.data),
  createRegime: (data: RegimeRequest) => apiClient.post<Regime>("/api/admin/regimes", data).then((r) => r.data),
  updateRegime: (id: number, data: RegimeRequest) => apiClient.put<Regime>(`/api/admin/regimes/${id}`, data).then((r) => r.data),
  activateRegime: (id: number) => apiClient.post(`/api/admin/regimes/${id}/activate`).then((r) => r.data),

  // Admin assignments
  getAssignments: () => apiClient.get<Assignment[]>("/api/admin/assignments").then((r) => r.data),
  createAssignment: (data: AssignmentRequest) => apiClient.post<Assignment>("/api/admin/assignments", data).then((r) => r.data),
  updateAssignment: (id: number, userId: number) => apiClient.put<Assignment>(`/api/admin/assignments/${id}`, null, { params: { userId } }).then((r) => r.data),

  // Users for assignment dropdown
  getUsers: (page = 0, size = 100, search = "") =>
    apiClient
      .get<PaginatedResponse<User>>("/api/admin/members", { params: { page, size, search } })
      .then((r) => r.data),

  // About Us
  getAboutUs: () => apiClient.get<AboutUsResponse>("/api/about-us").then((r) => r.data),
  updateAboutUs: (data: AboutUsRequest) => apiClient.put<AboutUsResponse>("/api/about-us", data).then((r) => r.data),
}