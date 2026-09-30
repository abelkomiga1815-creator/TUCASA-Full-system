import apiClient from "../client"
import { FeeBulkRequest, FeeCreateRequest, MembershipFee, PaginatedResponse } from "@/types"

export const feesApi = {
  // Admin
  list: (params: { status?: string; semesterId?: number; page?: number; size?: number } = {}) =>
    apiClient
      .get<PaginatedResponse<MembershipFee>>("/api/admin/fees", { params })
      .then((r) => r.data),

  create: (data: FeeCreateRequest) =>
    apiClient.post<MembershipFee>("/api/admin/fees", data).then((r) => r.data),

  confirm: (id: number) =>
    apiClient.post<MembershipFee>(`/api/admin/fees/${id}/confirm`).then((r) => r.data),

  waive: (id: number) =>
    apiClient.post<MembershipFee>(`/api/admin/fees/${id}/waive`).then((r) => r.data),

  bulkCreate: (data: FeeBulkRequest) =>
    apiClient
      .post<{ created: number }>("/api/admin/fees/bulk", data)
      .then((r) => r.data),

  // Member
  myFees: () =>
    apiClient.get<MembershipFee[]>("/api/members/fees/me").then((r) => r.data),

  // Shared (admin-only on backend)
  semesters: () =>
    apiClient
      .get<{ id: number; name: string; isActive: boolean }[]>("/api/admin/fees/semesters")
      .then((r) => r.data),
}
