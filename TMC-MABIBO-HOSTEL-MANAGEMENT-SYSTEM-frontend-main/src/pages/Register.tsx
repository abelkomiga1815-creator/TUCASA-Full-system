import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import axios from "axios"
import { useAuth } from "@/hooks/useAuth"
import { RegisterFormValues, registerSchema, TANZANIAN_REGIONS } from "@/utils/validators"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ProfileCropper } from "@/components/modals/ProfileCropper"
import { siteConfig } from "@/config/siteConfig"

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { university: "UDSM", isBaptized: false }
  })

  const handleSavePhoto = (file: File) => {
    setProfilePicture(file)
    setPreviewUrl(URL.createObjectURL(file))
    setCropperOpen(false)
  }

  const removeProfilePicture = () => {
    setProfilePicture(null)
    setPreviewUrl(null)
  }

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (key !== "confirmPassword" && value !== undefined) {
          formData.append(key, String(value))
        }
      })
      if (profilePicture) {
        formData.append("profilePicture", profilePicture)
      }

      await registerUser(formData)
      toast.success("Registration successful. Please sign in to continue.")
      navigate("/login")
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined
      toast.error(message ?? "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-muted px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card p-1.5 shadow-soft">
            <img
              src={siteConfig.logo}
              alt="PCM Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <CardTitle className="text-2xl">{siteConfig.branchName}</CardTitle>
          <CardDescription>Create your account &middot; {siteConfig.organizationName}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2" encType="multipart/form-data">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="middleName">Middle name (optional)</Label>
              <Input id="middleName" {...register("middleName")} />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="0712345678" {...register("phone")} />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div>
              <Label htmlFor="university">University</Label>
              <Input id="university" value="UDSM" readOnly disabled {...register("university")} />
            </div>
            <div>
              <Label htmlFor="program">Program</Label>
              <Input id="program" placeholder="BSc. Computer Science" {...register("program")} />
              {errors.program && <p className="mt-1 text-xs text-destructive">{errors.program.message}</p>}
            </div>
            <div>
              <Label htmlFor="yearOfStudy">Year of study</Label>
              <Select id="yearOfStudy" {...register("yearOfStudy")}>
                {[1, 2, 3, 4, 5, 6, 7].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="homeRegion">Home region</Label>
              <Select id="homeRegion" defaultValue="" {...register("homeRegion")}>
                <option value="" disabled>
                  Select a region
                </option>
                {TANZANIAN_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </Select>
              {errors.homeRegion && <p className="mt-1 text-xs text-destructive">{errors.homeRegion.message}</p>}
            </div>
            <div>
              <Label htmlFor="homeChurch">Home church</Label>
              <Input id="homeChurch" {...register("homeChurch")} />
              {errors.homeChurch && <p className="mt-1 text-xs text-destructive">{errors.homeChurch.message}</p>}
            </div>
            <div>
              <Label htmlFor="talent">Talent (optional)</Label>
              <Input id="talent" placeholder="Choir, ushering, media..." {...register("talent")} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox id="isBaptized" {...register("isBaptized")} />
              <Label htmlFor="isBaptized" className="mb-0">
                I have been baptized
              </Label>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" showPasswordToggle {...register("password")} />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" showPasswordToggle {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label className="block mb-2">
                Profile Picture (Recommended)
              </Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCropperOpen(true)}
                disabled={loading}
              >
                {previewUrl ? "Change Photo" : "Add Passport Photo"}
              </Button>
              {previewUrl && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <Button variant="ghost" size="sm" onClick={removeProfilePicture}>
                    Remove
                  </Button>
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </div>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>

      <ProfileCropper
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        onSave={handleSavePhoto}
      />
    </div>
  )
}