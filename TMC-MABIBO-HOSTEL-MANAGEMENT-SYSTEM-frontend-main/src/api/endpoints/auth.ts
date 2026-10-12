import apiClient from "../client"
import { AuthResponse, LoginPayload, RegisterResponse, User } from "@/types"

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/api/auth/login", payload).then((r) => r.data),

  register: (payload: FormData) =>
    apiClient.post<RegisterResponse>("/api/auth/register", payload, {
      // Do NOT set Content-Type manually: the browser must generate the
      // multipart boundary itself, otherwise the server cannot parse the body.
      headers: { "Content-Type": undefined }
    }).then((r) => r.data),

  me: () => apiClient.get<AuthResponse["user"]>("/api/members/me").then((r) => r.data),

  updateProfilePicture: (file: File) => {
    const formData = new FormData()
    formData.append("profilePicture", file)
    return apiClient.post<User>("/api/auth/profile-picture", formData, {
      headers: { "Content-Type": undefined }
    }).then((r) => r.data)
  },

  changePassword: (currentPassword: string, newPassword: string, confirmNewPassword: string) =>
    apiClient.post<void>("/api/auth/change-password", { currentPassword, newPassword, confirmNewPassword }).then((r) => r.data),

  // Forced change after an admin-issued temporary password: the temporary
  // password was already verified at login, so only the new one is submitted.
  forcedChangePassword: (newPassword: string, confirmNewPassword: string) =>
    apiClient
      .post<{ message: string }>("/api/auth/forced-change-password", { newPassword, confirmNewPassword })
      .then((r) => r.data),

  adminResetPassword: (userId: number, temporaryPassword: string, confirmTemporaryPassword: string) =>
    apiClient.post<User>(`/api/auth/admin/reset-password/${userId}`, { temporaryPassword, confirmTemporaryPassword }).then((r) => r.data)
}
