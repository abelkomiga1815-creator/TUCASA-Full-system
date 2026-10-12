import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { siteConfig } from "@/config/siteConfig"

export default function ForgotPassword() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-muted px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card p-1.5 shadow-soft">
            <img
              src={siteConfig.logo}
              alt="PCM Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>Password recovery is handled by an Administrator.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <Shield size={24} className="text-amber-600 dark:text-amber-400" />
            <div className="text-center">
              <p className="font-medium">Contact your Administrator</p>
              <p className="text-sm text-muted-foreground">
                To reset your password, please contact an administrator who can generate a temporary password for you.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/login")} className="w-full">
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}