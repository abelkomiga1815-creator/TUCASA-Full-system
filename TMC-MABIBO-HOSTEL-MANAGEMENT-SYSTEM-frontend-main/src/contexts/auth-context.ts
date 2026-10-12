import { createContext } from "react"
import { AuthResponse, LoginPayload, RegisterResponse, User } from "@/types"

export interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<AuthResponse>
  register: (payload: FormData) => Promise<RegisterResponse>
  logout: () => void
  refreshUser: (updated: User) => void
  updateProfilePicture: (file: File) => Promise<User>
  changePassword: (currentPassword: string, newPassword: string, confirmNewPassword: string) => Promise<void>
  semesterUpdated: boolean
  markSemesterUpdated: () => void
  redirectByRole: (role: User["role"]) => string
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
