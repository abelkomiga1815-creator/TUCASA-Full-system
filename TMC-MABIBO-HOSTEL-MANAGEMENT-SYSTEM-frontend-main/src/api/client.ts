import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { AuthResponse } from "@/types"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080"
const REFRESH_PATH = "/api/auth/refresh"
// Message returned by the backend while an account must change its password.
const PASSWORD_CHANGE_REQUIRED = "Password change required"

/**
 * Base URL of the backend API. Exported so that helpers which need to resolve
 * API-relative asset paths (profile pictures) share this single definition.
 */
export const API_BASE_URL = BASE_URL

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshRequest: Promise<string | null> | null = null

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("tucasa_refresh_token")
  if (!refreshToken) return null

  if (!refreshRequest) {
    refreshRequest = axios
      .post<AuthResponse>(`${BASE_URL}${REFRESH_PATH}`, { refreshToken })
      .then(({ data }) => {
        localStorage.setItem("tucasa_token", data.accessToken)
        localStorage.setItem("tucasa_refresh_token", data.refreshToken ?? refreshToken)
        localStorage.setItem("tucasa_user", JSON.stringify(data.user))
        return data.accessToken
      })
      .catch(() => null)
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
})

// Attach JWT to every outgoing request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("tucasa_token")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear session and force re-login
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequestConfig | undefined
    if (error.response?.status === 401 && request && !request._retry && request.url !== REFRESH_PATH) {
      request._retry = true
      const token = await refreshAccessToken()
      if (token) {
        request.headers.Authorization = `Bearer ${token}`
        return apiClient(request)
      }
    }

    // An admin reset this account's password while the user was signed in:
    // drop the session so the next sign-in triggers the forced password change.
    if (
      error.response?.status === 403 &&
      (error.response.data as { message?: string } | undefined)?.message === PASSWORD_CHANGE_REQUIRED
    ) {
      localStorage.removeItem("tucasa_token")
      localStorage.removeItem("tucasa_refresh_token")
      localStorage.removeItem("tucasa_user")
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("tucasa_token")
      localStorage.removeItem("tucasa_refresh_token")
      localStorage.removeItem("tucasa_user")
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
