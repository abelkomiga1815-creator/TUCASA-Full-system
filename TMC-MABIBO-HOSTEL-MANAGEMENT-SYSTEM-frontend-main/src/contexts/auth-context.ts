import { createContext } from "react"
import { LoginPayload, RegisterResponse, User } from "@/types"

export interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: FormData) => Promise<RegisterResponse>
  logout: () => void
  refreshUser: (updated: User) => void
  semesterUpdated: boolean
  markSemesterUpdated: () => void
  redirectByRole: (role: User["role"]) => string
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
