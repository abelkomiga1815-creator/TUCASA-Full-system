import {
  ReactNode,
  useCallback,
  useEffect,
  useState
} from "react"
import { authApi } from "@/api/endpoints/auth"
import { LoginPayload, User } from "@/types"
import { AuthContext } from "@/contexts/auth-context"

const semesterUpdateKey = (userId: number) =>
  `tucasa_semester_updated_${userId}_${new Date().getFullYear()}-${new Date().getMonth() < 6 ? "1" : "2"}`

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [semesterUpdated, setSemesterUpdated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("tucasa_token")
    const storedUser = localStorage.getItem("tucasa_user")
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User
        setUser(parsedUser)
        setSemesterUpdated(localStorage.getItem(semesterUpdateKey(parsedUser.id)) === "true")
      } catch {
        localStorage.removeItem("tucasa_user")
      }
    }
    setLoading(false)
  }, [])

  const persistSession = (token: string, nextUser: User) => {
    localStorage.setItem("tucasa_token", token)
    localStorage.setItem("tucasa_user", JSON.stringify(nextUser))
    setUser(nextUser)
    setSemesterUpdated(localStorage.getItem(semesterUpdateKey(nextUser.id)) === "true")
  }

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authApi.login(payload)
    if (res.refreshToken) localStorage.setItem("tucasa_refresh_token", res.refreshToken)
    persistSession(res.accessToken, res.user)
    return res
  }, [])

  const register = useCallback(async (payload: FormData) => {
    const res = await authApi.register(payload)
    // Registration no longer returns tokens - user must log in separately
    return res
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("tucasa_token")
    localStorage.removeItem("tucasa_refresh_token")
    localStorage.removeItem("tucasa_user")
    setUser(null)
    setSemesterUpdated(false)
  }, [])

  const refreshUser = useCallback((updated: User) => {
    localStorage.setItem("tucasa_user", JSON.stringify(updated))
    setUser(updated)
  }, [])

  const updateProfilePicture = useCallback(async (file: File) => {
    const updatedUser = await authApi.updateProfilePicture(file)
    refreshUser(updatedUser)
    return updatedUser
  }, [refreshUser])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string, confirmNewPassword: string) => {
    await authApi.changePassword(currentPassword, newPassword, confirmNewPassword)
    // Refresh user to get updated mustChangePassword status
    const res = await authApi.me()
    refreshUser(res)
  }, [refreshUser])

  const markSemesterUpdated = useCallback(() => {
    if (!user) return
    localStorage.setItem(semesterUpdateKey(user.id), "true")
    setSemesterUpdated(true)
  }, [user])

  const redirectByRole = useCallback((role: User["role"]): string => {
    switch (role) {
      case "ADMIN":
        return "/admin"
      case "LEADER":
        return "/leader"
      case "MEMBER":
      default:
        return "/dashboard"
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, updateProfilePicture, changePassword, semesterUpdated, markSemesterUpdated, redirectByRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}
