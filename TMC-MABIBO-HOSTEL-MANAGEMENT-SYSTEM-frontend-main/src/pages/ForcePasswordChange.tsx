import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { authApi } from "@/api/endpoints/auth"
import { forcePasswordChangeSchema } from "@/utils/validators"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, KeyRound } from "lucide-react"
import axios from "axios"

const forcePasswordChangeFormSchema = forcePasswordChangeSchema

type ForcePasswordChangeFormValues = z.infer<typeof forcePasswordChangeFormSchema>

export default function ForcePasswordChange() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)

  // Nothing to change (e.g. the account already completed the forced change).
  useEffect(() => {
    if (user && !user.mustChangePassword) {
      navigate("/dashboard", { replace: true })
    }
  }, [user, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForcePasswordChangeFormValues>({
    resolver: zodResolver(forcePasswordChangeFormSchema),
  })

  const onSubmit = async (values: ForcePasswordChangeFormValues) => {
    setLoading(true)
    try {
      await authApi.forcedChangePassword(values.newPassword, values.confirmPassword)

      // The temporary session is no longer valid: drop every trace of it and
      // force a fresh sign-in with the new permanent password.
      logout()
      toast.success("Password changed successfully")
      navigate("/login", {
        replace: true,
        state: {
          notice: "Password changed successfully. Please sign in using your new password."
        }
      })
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined
      toast.error(message ?? "Password change failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-muted px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
            <KeyRound size={32} className="text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl">Password Change Required</CardTitle>
          <CardDescription>
            Your password was reset by an Administrator. Choose a new password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                showPasswordToggle
                placeholder="New password (min 8 characters)"
                {...register("newPassword")}
              />
              {errors.newPassword && <p className="mt-1 text-xs text-destructive">{errors.newPassword.message}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                showPasswordToggle
                placeholder="Confirm new password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Changing password..." : "Change Password"}
            </Button>
          </form>

          <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>
              You will be signed out once your new password is saved, and will need to sign in again.
            </span>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <a
              href="#"
              className="text-primary font-medium hover:underline"
              onClick={(e) => {
                e.preventDefault()
                logout()
                navigate("/login")
              }}
            >
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
