import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import axios from "axios"
import { authApi } from "@/api/endpoints/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ProfileCropper } from "@/components/modals/ProfileCropper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Moon, Sun, Bell, Shield, Palette, User, Key, LogOut, X } from "lucide-react"
import { cn } from "@/utils/cn"
import { imageUrl } from "@/utils/imageUrl"

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  program: z.string().min(1, "Program is required"),
  talent: z.string().optional(),
})

type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>

export default function Settings() {
  const { user, updateProfilePicture, logout, refreshUser } = useAuth()
  const navigate = useNavigate()

  const { theme, toggleTheme } = useTheme()
  const darkMode = theme === "dark"
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [announcementNotifications, setAnnouncementNotifications] = useState(true)
  const [eventNotifications, setEventNotifications] = useState(true)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"account" | "appearance" | "notifications" | "privacy" | "security">("account")
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false)

  const profileForm = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      middleName: user?.middleName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
      program: user?.program ?? "",
      talent: user?.talent ?? "",
    },
  })

  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
  })

  const handleProfileSubmit = async (values: ProfileUpdateFormValues) => {
    if (!user) return
    try {
      // In a real app, this would call an API to update profile
      const updatedUser = { ...user, ...values }
      refreshUser(updatedUser)
      toast.success("Profile updated successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update profile")
    }
  }

  const handlePasswordSubmit = async (values: PasswordChangeFormValues) => {
    try {
      await authApi.changePassword(values.currentPassword, values.newPassword, values.confirmPassword)
      toast.success("Password changed successfully")
      setPasswordChangeOpen(false)
      passwordForm.reset()
    } catch (err) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined
      toast.error(message ?? "Failed to change password")
    }
  }

  const handleSavePhoto = async (file: File) => {
    try {
      await updateProfilePicture(file)
      toast.success("Profile photo updated")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update profile photo")
    }
  }

  const handleDarkModeToggle = () => toggleTheme()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "security", label: "Security", icon: Key },
  ]

  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-20 sm:pb-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex flex-wrap gap-2 border-b pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "ghost"}
            size="sm"
            className="gap-1.5"
            onClick={() => setActiveTab(id as typeof activeTab)}
          >
            <Icon size={16} />
            {label}
          </Button>
        ))}
      </div>

      {/* Account Tab */}
      {activeTab === "account" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Account</CardTitle>
                <CardDescription>Manage your profile information</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                  <AvatarImage src={imageUrl(user.profilePicUrl)} alt={user.firstName} />
                  <AvatarFallback className="text-lg font-medium">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={() => setCropperOpen(true)} className="gap-2">
                  <Camera size={16} />
                  Change Photo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" {...profileForm.register("firstName")} />
                  {profileForm.formState.errors.firstName && (
                    <p className="mt-1 text-xs text-destructive">{profileForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" {...profileForm.register("lastName")} />
                  {profileForm.formState.errors.lastName && (
                    <p className="mt-1 text-xs text-destructive">{profileForm.formState.errors.lastName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="middleName">Middle name (optional)</Label>
                  <Input id="middleName" {...profileForm.register("middleName")} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="0712345678" {...profileForm.register("phone")} />
                  {profileForm.formState.errors.phone && (
                    <p className="mt-1 text-xs text-destructive">{profileForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="program">Program</Label>
                  <Input id="program" {...profileForm.register("program")} />
                  {profileForm.formState.errors.program && (
                    <p className="mt-1 text-xs text-destructive">{profileForm.formState.errors.program.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="talent">Talent (optional)</Label>
                  <Input id="talent" placeholder="Choir, ushering, media..." {...profileForm.register("talent")} />
                </div>
              </div>
              <Button type="submit" className="w-full sm:w-auto">Save Changes</Button>
            </form>

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Danger Zone</p>
                <p className="text-sm text-muted-foreground">Irreversible actions</p>
              </div>
              <Button variant="destructive" onClick={handleLogout} className="gap-2">
                <LogOut size={16} />
                Log out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Appearance</CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", darkMode ? "bg-slate-800" : "bg-primary/10")}>
                  {darkMode ? <Moon size={20} className="text-yellow-400" /> : <Sun size={20} className="text-amber-500" />}
                </div>
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
                aria-label="Toggle dark mode"
              />
            </div>

            <Separator />

            <div>
              <p className="font-medium mb-3">System Theme</p>
              <p className="text-sm text-muted-foreground mb-4">When disabled, the app will follow your system preference</p>
              <div className="flex gap-2">
                <Button
                  variant={!darkMode ? "default" : "outline"}
                  onClick={() => handleDarkModeToggle()}
                  className="flex-1"
                >
                  <Sun size={16} className="mr-1" />
                  Light
                </Button>
                <Button
                  variant={darkMode ? "default" : "outline"}
                  onClick={() => handleDarkModeToggle()}
                  className="flex-1"
                >
                  <Moon size={16} className="mr-1" />
                  Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Notifications</CardTitle>
            <CardDescription>Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bell size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                aria-label="Toggle push notifications"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Bell size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Announcements</p>
                  <p className="text-sm text-muted-foreground">New announcements from leadership</p>
                </div>
              </div>
              <Switch
                checked={announcementNotifications}
                onCheckedChange={setAnnouncementNotifications}
                disabled={!notificationsEnabled}
                aria-label="Toggle announcement notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Bell size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">Events</p>
                  <p className="text-sm text-muted-foreground">Upcoming event reminders</p>
                </div>
              </div>
              <Switch
                checked={eventNotifications}
                onCheckedChange={setEventNotifications}
                disabled={!notificationsEnabled}
                aria-label="Toggle event notifications"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Tab */}
      {activeTab === "privacy" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Privacy</CardTitle>
            <CardDescription>Control your privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Shield size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Privacy Settings</h3>
              <p className="text-muted-foreground">
                Privacy controls are managed by the organization. Contact your administrator for more information.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Security</CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
              </div>
              <Button variant="outline" onClick={() => setPasswordChangeOpen(true)} className="gap-2">
                <Key size={16} />
                Change Password
              </Button>
            </div>

            <Separator />

            <div className="text-center py-8">
              <Shield size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
              <p className="text-muted-foreground mb-4">
                Two-factor authentication is not yet available. This feature is planned for a future release.
              </p>
              <Button variant="outline" disabled>
                Enable 2FA (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Change Modal */}
      {passwordChangeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setPasswordChangeOpen(false)}>
          <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <Button variant="ghost" size="icon" onClick={() => setPasswordChangeOpen(false)}>
                <X size={20} />
              </Button>
            </div>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="p-4 space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  showPasswordToggle
                  {...passwordForm.register("currentPassword")}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  showPasswordToggle
                  {...passwordForm.register("newPassword")}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  showPasswordToggle
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setPasswordChangeOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Cropper Modal */}
      <ProfileCropper
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        onSave={handleSavePhoto}
      />
    </div>
  )
}