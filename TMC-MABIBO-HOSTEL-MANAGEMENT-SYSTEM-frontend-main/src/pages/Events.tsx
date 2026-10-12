import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { memberApi } from "@/api/endpoints/member"
import { permissionsApi } from "@/api/endpoints/permissions"
import { EventItem, PaginatedResponse } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react"

export default function Events() {
  const { user } = useAuth()
  const [data, setData] = useState<PaginatedResponse<EventItem> | null>(null)
  const [canCreate, setCanCreate] = useState(false)
  const [permLoading, setPermLoading] = useState(true)
  const [page, setPage] = useState(0)

  const events = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  useEffect(() => {
    memberApi
      .getEvents(10, page)
      .then(setData)
  }, [page])

  useEffect(() => {
    if (user?.role === "LEADER") {
      permissionsApi.getPermissions(user.id)
        .then((p) => setCanCreate(p.canCreateEvents))
        .catch(() => setCanCreate(false))
        .finally(() => setPermLoading(false))
    } else if (user?.role === "ADMIN") {
      setCanCreate(true)
      setPermLoading(false)
    } else {
      setPermLoading(false)
    }
  }, [user])

  const showCreateButton = user?.role === "ADMIN" || (user?.role === "LEADER" && canCreate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Events</h1>
          <p className="text-muted-foreground">Upcoming and past events</p>
        </div>
        {showCreateButton && (
          <Button onClick={() => window.location.href = "/events/create"}>
            <Plus size={16} className="mr-2" />
            Create Event
          </Button>
        )}
        {user?.role === "LEADER" && permLoading && !canCreate && (
          <Button disabled>
            Checking permissions...
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events found.</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <Card key={event.id} className="border-dashed">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">{event.description}</p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>{new Date(event.startsAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>{event.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
        </CardContent>
      </Card>
    </div>
  )
}