import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { memberApi } from "@/api/endpoints/member"
import { permissionsApi } from "@/api/endpoints/permissions"
import { Announcement, PaginatedResponse } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"

function formatExpiryDate(expiryAt: string | undefined): string | null {
  if (!expiryAt) return null;
  return new Date(expiryAt).toLocaleDateString();
}

export default function Announcements() {
  const { user } = useAuth()
  const [data, setData] = useState<PaginatedResponse<Announcement> | null>(null)
  const [canPost, setCanPost] = useState(false)
  const [permLoading, setPermLoading] = useState(true)
  const [page, setPage] = useState(0)

  const announcements = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  useEffect(() => {
    memberApi
      .getAnnouncements(10, page)
      .then(setData)
  }, [page])

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

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No announcements found.</p>
          </CardContent>
        </Card>
      ) : (
        <>
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
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}