import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { memberApi } from "@/api/endpoints/member"
import { permissionsApi } from "@/api/endpoints/permissions"
import { Announcement } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

function formatExpiryDate(expiryAt: string | undefined): string | null {
  if (!expiryAt) return null;
  return new Date(expiryAt).toLocaleDateString();
}

export default function Announcements() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [canPost, setCanPost] = useState(false)
  const [permLoading, setPermLoading] = useState(true)

  useEffect(() => {
    memberApi
      .getAnnouncements()
      .then(setAnnouncements)
  }, [])

  useEffect(() => {
    if (user?.role === "LEADER") {
      permissionsApi.getPermissions(user.id)
        .then((p) => setCanPost(p.canPostAnnouncements))
        .catch(() => setCanPost(false))
        .finally(() => setPermLoading(false))
    } else if (user?.role === "ADMIN") {
      setCanPost(true)
      setPermLoading(false)
    } else {
      setPermLoading(false)
    }
  }, [user])

  const showPostButton = user?.role === "ADMIN" || (user?.role === "LEADER" && canPost)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Announcements</h1>
          <p className="text-muted-foreground">Stay updated with latest announcements</p>
        </div>
        {showPostButton && (
          <Button onClick={() => window.location.href = "/announcements/post"}>
            <Plus size={16} className="mr-2" />
            Post Announcement
          </Button>
        )}
        {user?.role === "LEADER" && permLoading && !canPost && (
          <Button disabled>
            Checking permissions...
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => {
          const expiry = formatExpiryDate(announcement.expiryAt);
          return (
            <Card key={announcement.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                    <p className="text-muted-foreground mt-1">{announcement.content}</p>
                    <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>Posted: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                      {expiry && (
                        <Badge variant="secondary">
                          Expires: {expiry}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  )
}