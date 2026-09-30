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

// Forgot password schema
export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  channel: z.enum(["EMAIL", "SMS"])
})

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>

// Reset password schema
export const resetPasswordSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  channel: z.enum(["EMAIL", "SMS"]),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d{6}$/, "OTP must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>
