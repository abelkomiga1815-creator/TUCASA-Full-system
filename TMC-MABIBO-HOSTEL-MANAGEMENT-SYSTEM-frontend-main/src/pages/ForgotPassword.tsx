import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ForgotPasswordRequest, forgotPasswordSchema } from "@/utils/validators"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { siteConfig } from "@/config/siteConfig"
import { Mail, Smartphone } from "lucide-react"
import axios from "axios"
import { authApi } from "@/api/endpoints/auth"

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { channel: "EMAIL" },
  })

  const channel = watch("channel")

  const onSubmit = async (values: ForgotPasswordRequest) => {
    setLoading(true)
    try {
      await authApi.forgotPassword(values)
      toast.success("If an account exists, a reset code has been sent.")
      navigate("/reset-password")
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined
      toast.error(message ?? "Failed to send reset code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1.5 shadow-soft">
            <img
              src={siteConfig.logo}
              alt="PCM Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>Enter your email or phone to receive a reset code</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="identifier" className="block mb-1">
                {channel === "EMAIL" ? "Email" : "Phone Number"}
              </Label>
              <Input
                id="identifier"
                type={channel === "EMAIL" ? "email" : "tel"}
                placeholder={channel === "EMAIL" ? "you@example.com" : "+255 7XX XXX XXX"}
                {...register("identifier")}
              />
              {errors.identifier && <p className="mt-1 text-xs text-destructive">{errors.identifier.message}</p>}
            </div>

            <div>
              <Label className="block mb-1">Delivery Method</Label>
              <Select
                {...register("channel")}
                value={channel}
              >
                <option value="EMAIL">
                  <Mail className="mr-2 h-4 w-4 inline" />
                  Email
                </option>
                <option value="SMS">
                  <Smartphone className="mr-2 h-4 w-4 inline" />
                  SMS
                </option>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}