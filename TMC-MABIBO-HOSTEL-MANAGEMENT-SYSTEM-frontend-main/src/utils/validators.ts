import { z } from "zod"

// Tanzanian phone format: accepts 07XXXXXXXX, 06XXXXXXXX, or +2557XXXXXXXX / +2556XXXXXXXX
const TZ_PHONE_REGEX = /^(?:\+255|0)([67]\d{8})$/

export const TANZANIAN_REGIONS = [
  "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera",
  "Katavi", "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara",
  "Mbeya", "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pemba North",
  "Pemba South", "Pwani", "Rukwa", "Ruvuma", "Shinyanga", "Simiyu",
  "Singida", "Songwe", "Tabora", "Tanga", "Unguja North", "Unguja South",
  "Zanzibar Urban/West"
] as const

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    phone: z
      .string()
      .regex(TZ_PHONE_REGEX, "Enter a valid Tanzanian phone number (e.g. 0712345678)"),
    university: z.literal("UDSM"),
    program: z.string().min(1, "Program is required"),
    yearOfStudy: z.coerce.number().int().min(1).max(7),
    isBaptized: z.boolean().default(false),
    homeRegion: z.string().min(1, "Home region is required"),
    homeChurch: z.string().min(1, "Home church is required"),
    talent: z.string().optional(),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required")
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const semesterUpdateSchema = z.object({
  yearOfStudy: z.coerce.number().int().min(1).max(7),
  phone: z.string().regex(TZ_PHONE_REGEX, "Enter a valid Tanzanian phone number"),
  talent: z.string().optional()
})

export type SemesterUpdateFormValues = z.infer<typeof semesterUpdateSchema>

// Change password schema (for normal password change from settings)
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>

// Admin reset password schema
export const adminResetPasswordSchema = z.object({
  temporaryPassword: z.string().min(8, "Temporary password must be at least 8 characters"),
  confirmTemporaryPassword: z.string()
}).refine((data) => data.temporaryPassword === data.confirmTemporaryPassword, {
  message: "Passwords do not match",
  path: ["confirmTemporaryPassword"]
})

export type AdminResetPasswordRequest = z.infer<typeof adminResetPasswordSchema>

// Force password change schema (for users who must change password after admin reset)
export const forcePasswordChangeSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

export type ForcePasswordChangeRequest = z.infer<typeof forcePasswordChangeSchema>
