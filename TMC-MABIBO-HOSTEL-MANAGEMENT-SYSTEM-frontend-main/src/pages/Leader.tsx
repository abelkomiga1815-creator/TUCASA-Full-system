import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Megaphone, CalendarPlus, Lock } from "lucide-react"
import { permissionsApi } from "@/api/endpoints/permissions"
import { LeaderPermission } from "@/types"
import { cn } from "@/utils/cn"

export default function Leader() {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<LeaderPermission | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      permissionsApi.getPermissions(user.id)
        .then(setPermissions)
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [user])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded dark:bg-slate-700" />
          <div className="h-4 w-64 bg-slate-200 rounded dark:bg-slate-700" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 bg-slate-100 rounded-lg dark:bg-slate-800" />
            <div className="h-32 bg-slate-100 rounded-lg dark:bg-slate-800" />
            <div className="h-32 bg-slate-100 rounded-lg dark:bg-slate-800" />
          </div>
        </div>
      </div>
    )
  }

  const canUploadMaterials = permissions?.canUploadMaterials ?? false
  const canPostAnnouncements = permissions?.canPostAnnouncements ?? false
  const canCreateEvents = permissions?.canCreateEvents ?? false

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Leader Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user?.firstName} {user?.lastName}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Leader Tools
            {(!canUploadMaterials && !canPostAnnouncements && !canCreateEvents) && (
              <span className="text-sm text-muted-foreground font-normal ml-2">(No permissions granted)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className={cn("border-dashed p-6 text-center transition-colors", canUploadMaterials ? "border-primary/50 bg-primary/5 hover:border-primary" : "opacity-50")}>
              <FileText size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">{canUploadMaterials ? "Upload Materials" : "Upload Materials"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {canUploadMaterials ? "You have permission to upload spiritual materials" : "Permission required from admin"}
              </p>
              <Button
                variant={canUploadMaterials ? "default" : "outline"}
                className="mt-3"
                disabled={!canUploadMaterials}
                onClick={() => window.location.href = "/materials"}
              >
                {canUploadMaterials ? "Go to Materials" : "Locked"}
              </Button>
              {!canUploadMaterials && <Lock size={16} className="mx-auto mt-2 text-muted-foreground" />}
            </Card>

            <Card className={cn("border-dashed p-6 text-center transition-colors", canPostAnnouncements ? "border-primary/50 bg-primary/5 hover:border-primary" : "opacity-50")}>
              <Megaphone size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">{canPostAnnouncements ? "Post Announcements" : "Post Announcements"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {canPostAnnouncements ? "You have permission to post announcements" : "Permission required from admin"}
              </p>
              <Button
                variant={canPostAnnouncements ? "default" : "outline"}
                className="mt-3"
                disabled={!canPostAnnouncements}
                onClick={() => window.location.href = "/announcements"}
              >
                {canPostAnnouncements ? "Go to Announcements" : "Locked"}
              </Button>
              {!canPostAnnouncements && <Lock size={16} className="mx-auto mt-2 text-muted-foreground" />}
            </Card>

            <Card className={cn("border-dashed p-6 text-center transition-colors", canCreateEvents ? "border-primary/50 bg-primary/5 hover:border-primary" : "opacity-50")}>
              <CalendarPlus size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">{canCreateEvents ? "Create Events" : "Create Events"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {canCreateEvents ? "You have permission to create events" : "Permission required from admin"}
              </p>
              <Button
                variant={canCreateEvents ? "default" : "outline"}
                className="mt-3"
                disabled={!canCreateEvents}
                onClick={() => window.location.href = "/events"}
              >
                {canCreateEvents ? "Go to Events" : "Locked"}
              </Button>
              {!canCreateEvents && <Lock size={16} className="mx-auto mt-2 text-muted-foreground" />}
            </Card>
          </div>

          {(!canUploadMaterials || !canPostAnnouncements || !canCreateEvents) && (
            <Card className="bg-slate-50 border-dashed dark:bg-muted/30">
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                <Lock size={20} className="mx-auto mb-2 opacity-50" />
                <p>Some tools are locked. Contact an admin to request permissions.</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}