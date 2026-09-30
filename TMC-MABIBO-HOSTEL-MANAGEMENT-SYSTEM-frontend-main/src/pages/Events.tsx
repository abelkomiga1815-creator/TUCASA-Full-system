import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { memberApi } from "@/api/endpoints/member"
import { permissionsApi } from "@/api/endpoints/permissions"
import { EventItem } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus } from "lucide-react"

export default function Events() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [canCreate, setCanCreate] = useState(false)
  const [permLoading, setPermLoading] = useState(true)

  useEffect(() => {
    memberApi
      .getEvents()
      .then(setEvents)
  }, [])

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
        </CardContent>
      </Card>
    </div>
  )
}