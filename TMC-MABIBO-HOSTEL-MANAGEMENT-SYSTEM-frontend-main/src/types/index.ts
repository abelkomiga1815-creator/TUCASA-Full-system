export type Role = "MEMBER" | "LEADER" | "ADMIN"

export interface User {
  id: number
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone: string
  university: string
  program: string
  yearOfStudy: number
  isBaptized: boolean
  homeRegion: string
  homeChurch: string
  talent?: string
  role: Role
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE"
  profilePicUrl?: string
  mustChangePassword?: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  tokenType?: string
  user: User
}

export interface RegisterResponse {
  id: number
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone: string
  university: string
  program: string
  yearOfStudy: number
  isBaptized: boolean
  homeRegion: string
  homeChurch: string
  talent?: string
  role: Role
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE"
  profilePicUrl?: string
  branchId?: number
  branchName?: string
  createdAt: string
}

export interface UserResponse {
  id: number
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone: string
  university: string
  program: string
  yearOfStudy: number
  isBaptized: boolean
  homeRegion: string
  homeChurch: string
  talent?: string
  role: Role
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE"
  profilePicUrl?: string
  branchId?: number
  branchName?: string
  createdAt: string
}

export interface RegisterPayload {
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone: string
  university: string
  program: string
  yearOfStudy: number
  isBaptized: boolean
  homeRegion: string
  homeChurch: string
  talent?: string
  password: string
  profilePicture?: File
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SemesterUpdatePayload {
  yearOfStudy: number
  phone: string
  talent?: string
}

export interface Material {
  id: number
  title: string
  description: string
  fileUrl: string
  uploadedBy: string
  createdAt: string
}

export interface Announcement {
  id: number
  title: string
  content: string
  expiryAt?: string
  createdAt: string
}

export interface EventItem {
  id: number
  title: string
  description: string
  startsAt: string
  endsAt?: string
  location: string
}

export interface ChatMessage {
  id?: number
  senderId: number
  senderName: string
  senderProfilePicUrl?: string
  message: string
  sentAt: string
  roomId: string
}

export interface AlumniRecord {
  id: number
  fullName: string
  email: string
  program: string
  graduationYear: number
  archivedAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
}

export interface Position {
  id: number
  name: string
  description?: string
  responsibilities?: string
  level: number
  departmentTag?: string
  isRetired: boolean
  createdAt: string
  updatedAt?: string
  leader?: {
    id: number
    firstName: string
    lastName: string
    profilePicUrl?: string
  }
}

export interface PositionRequest {
  name: string
  description?: string
  responsibilities?: string
  level: number
  departmentTag?: string
}

export interface Regime {
  id: number
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  leaders?: Array<{
    positionId: number
    positionName: string
    level: number
    departmentTag?: string
    leader?: {
      id: number
      firstName: string
      lastName: string
      profilePicUrl?: string
    }
  }>
}

export interface RegimeRequest {
  name: string
  startDate: string
  endDate: string
}

export interface Assignment {
  id: number
  user: User
  position: {
    id: number
    name: string
    level: number
  }
  regime: {
    id: number
    name: string
  }
  assignedAt: string
  assignedBy: User
  isCurrent: boolean
}

export interface AssignmentRequest {
  userId: number
  positionId: number
  regimeId: number
}

export type FeeStatus = "PENDING" | "PAID" | "WAIVED"

export interface MembershipFee {
  id: number
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
  semester?: {
    id: number
    name: string
  } | null
  amount: number
  currency: string
  status: FeeStatus
  paymentMethod?: string | null
  referenceNumber?: string | null
  paidAt?: string | null
  confirmedBy?: {
    id: number
    firstName: string
    lastName: string
    email: string
  } | null
  confirmedAt?: string | null
  notes?: string | null
  createdAt: string
  updatedAt?: string
}

export interface FeeCreateRequest {
  userId: number
  semesterId?: number
  amount: number
  currency?: string
  paymentMethod?: string
  referenceNumber?: string
  notes?: string
}

export interface FeeBulkRequest {
  semesterId: number
  amount: number
  currency?: string
  notes?: string
}

export interface LeaderPermission {
  id: number
  user: User
  canUploadMaterials: boolean
  canPostAnnouncements: boolean
  canCreateEvents: boolean
  grantedBy: User
  grantedAt: string
  updatedAt: string
}

export interface LeaderPermissionRequest {
  canUploadMaterials: boolean
  canPostAnnouncements: boolean
  canCreateEvents: boolean
}

export interface AboutUsResponse {
  id: number
  title: string
  description: string
  mission: string
  vision: string
  contactInformation: string
  organizationName: string
  branchName: string
  createdAt: string
  updatedAt: string
}

export interface AboutUsRequest {
  title?: string
  description?: string
  mission?: string
  vision?: string
  contactInformation?: string
  organizationName?: string
  branchName?: string
}
