import apiClient from "../client"
import { LeaderPermission, LeaderPermissionRequest } from "@/types"

export const permissionsApi = {
  getPermissions: (userId: number) => apiClient.get<LeaderPermission>(`/api/admin/leaders/${userId}/permissions`).then((r) => r.data),
  updatePermissions: (userId: number, data: LeaderPermissionRequest) => apiClient.put<LeaderPermission>(`/api/admin/leaders/${userId}/permissions`, data).then((r) => r.data),
}