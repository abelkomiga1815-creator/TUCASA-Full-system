import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import axios from "axios"
import { useAuth } from "@/hooks/useAuth"
import { LoginFormValues, loginSchema } from "@/utils/validators"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { siteConfig } from "@/config/siteConfig"

export default function Login() {
  const { login, redirectByRole, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      await login(values)
      toast.success("Welcome back")
      // Use role-based redirect
      const targetPath = user ? redirectByRole(user.role) : "/dashboard"
      navigate(targetPath)
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined
      toast.error(message ?? "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100 px-4 py-10">
      <Card className="w-full max-w-4xl overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          {/* Branding panel */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-950 via-primary to-secondary p-8 text-white md:flex">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              aria-hidden="true"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0, transparent 40%), radial-gradient(circle at 80% 90%, rgba(255,255,255,0.25) 0, transparent 45%)",
              }}
            />
            <div className="relative flex items-center gap-3">
              <img
                src={siteConfig.logo}
                alt="PCM Logo"
                className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-medium"
              />
              <div className="leading-tight">
                <p className="text-sm font-bold tracking-tight">{siteConfig.branchName}</p>
                <p className="text-[11px] text-white/80">UDSM Mabibo Hostel</p>
              </div>
            </div>
            <div className="relative">
              <h2 className="text-2xl font-bold leading-snug">
                Faith, fellowship
                <br />
                and academic growth.
              </h2>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/80">
                {siteConfig.organizationName} — the student community of UDSM Mabibo Hostel.
              </p>
            </div>
            <p className="relative text-xs text-white/60">
              Follow Jesus. Embrace His Mission. Change the World.
            </p>
          </div>

          {/* Form panel */}
          <div className="p-6 sm:p-8">
            <CardHeader className="p-0 text-left">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1 shadow-soft md:hidden">
                <img src={siteConfig.logo} alt="PCM Logo" className="h-full w-full object-contain" />
              </div>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to {siteConfig.branchName}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password && (
                    <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Register
                </Link>
              </p>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Forgot password?{" "}
                <Link to="/forgot-password" className="text-primary font-medium hover:underline">
                  Reset password
                </Link>
              </p>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  )
}
