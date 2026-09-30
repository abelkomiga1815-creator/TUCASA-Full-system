import apiClient from "../client"
import { AuthResponse, LoginPayload, RegisterResponse, ForgotPasswordRequest, ResetPasswordRequest } from "@/types"

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/api/auth/login", payload).then((r) => r.data),

  register: (payload: FormData) =>
    apiClient.post<RegisterResponse>("/api/auth/register", payload, {
      // Do NOT set Content-Type manually: the browser must generate the
      // multipart boundary itself, otherwise the server cannot parse the body.
      headers: { "Content-Type": undefined }
    }).then((r) => r.data),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    apiClient.post<void>("/api/auth/forgot-password", payload).then((r) => r.data),

  resetPassword: (payload: ResetPasswordRequest) =>
    apiClient.post<void>("/api/auth/reset-password", payload).then((r) => r.data),

  me: () => apiClient.get<AuthResponse["user"]>("/api/members/me").then((r) => r.data)
}
