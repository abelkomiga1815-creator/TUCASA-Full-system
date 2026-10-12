import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { memberApi } from "@/api/endpoints/member"
import { leaderApi } from "@/api/endpoints/admin"
import { Announcement, EventItem } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UploadMaterialModal } from "@/components/modals/UploadMaterialModal"
import { PostAnnouncementModal } from "@/components/modals/PostAnnouncementModal"
import { CreateEventModal } from "@/components/modals/CreateEventModal"
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Users,
  Calendar,
  Megaphone,
  TrendingUp,
  FileText,
  ChevronRight,
} from "lucide-react"

export default function Dashboard() {
  const { user, semesterUpdated } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [activeCount, setActiveCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"material" | "announcement" | "event" | null>(null)
  // Bumped after a successful create so the recent lists below are refetched
  // with the new record instead of waiting for a full page reload.
  const [reloadKey, setReloadKey] = useState(0)

  const isLeaderOrAdmin = user?.role === "LEADER" || user?.role === "ADMIN"

  useEffect(() => {
    async function load() {
      try {
        const [a, e] = await Promise.all([
          memberApi.getAnnouncements(3),
          memberApi.getEvents(3)
        ])
        setAnnouncements(a.content ?? a)
        setEvents(e.content ?? e)
        if (isLeaderOrAdmin) {
          const { count } = await leaderApi.getActiveCount()
          setActiveCount(count)
        }
      } catch {
        // swallow — page still renders with empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isLeaderOrAdmin, reloadKey])

  const stats = [
    {
      title: "Your Profile",
      subtitle: `${user?.program}, Year ${user?.yearOfStudy}`,
      icon: LayoutDashboard,
      color: "from-primary to-primary/80",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-24 shrink-0">Email</span>
            <span className="text-sm font-medium truncate">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-24 shrink-0">Phone</span>
            <span className="text-sm font-medium">{user?.phone}</span>
          </div>
          <Badge variant={user?.isBaptized ? "success" : "outline"}>
            {user?.isBaptized ? "Baptized" : "Not baptized"}
          </Badge>
        </div>
      ),
    },
    ...(isLeaderOrAdmin
      ? [
          {
            title: "Active Members",
            subtitle: "Current semester",
            icon: Users,
            color: "from-secondary to-secondary/80",
            content: loading ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <p className="text-3xl font-bold text-secondary">
                {activeCount ?? "—"}
              </p>
            ),
          },
        ]
      : [
          {
            title: "Quick Links",
            subtitle: "Navigate to key sections",
            icon: BookOpen,
            color: "from-blue-500 to-blue-600",
            content: (
              <div className="flex flex-col gap-2">
                <Link to="/materials" className="group">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <BookOpen size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Spiritual Materials</span>
                    <ChevronRight size={16} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </Button>
                </Link>
                <Link to="/chat" className="group">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <MessageSquare size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Chat</span>
                    <ChevronRight size={16} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </Button>
                </Link>
              </div>
            ),
          },
        ]),
    {
      title: "Spiritual Growth",
      subtitle: "Track your journey",
      icon: TrendingUp,
      color: "from-amber-500 to-orange-500",
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Baptism Status</span>
            <Badge variant={user?.isBaptized ? "success" : "warning"}>
              {user?.isBaptized ? "Completed" : "Pending"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Semester Update</span>
            <Badge variant={semesterUpdated ? "default" : "warning"}>
              {semesterUpdated ? "Current" : "Required"}
            </Badge>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-8 sm:pb-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8 animate-slide-up delay-100">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, <span className="gradient-text">{user?.firstName}</span>
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Here&apos;s what&apos;s happening in your community today.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up delay-300">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="card-hover overflow-hidden relative animate-slide-up delay-100" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/50 dark:to-white/5" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon size={20} className="text-white" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
                  <CardDescription className="text-xs">{stat.subtitle}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {stat.content}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Announcements & Events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8 animate-slide-up delay-400">
        {/* Announcements */}
        <Card className="card-hover overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Megaphone size={18} className="text-white" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Recent Announcements</CardTitle>
                <CardDescription className="text-xs">Latest updates from leadership</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {loading ? (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Megaphone size={32} className="text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No announcements yet</p>
              </div>
            ) : (
              announcements.map((a) => (
                <div
                  key={a.id}
                  className="group rounded-xl border p-4 transition-all hover:bg-muted/30 hover:border-primary/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground line-clamp-1">{a.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.content}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">Announcement</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="card-hover overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <Calendar size={18} className="text-white" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
                <CardDescription className="text-xs">Don&apos;t miss what&apos;s coming up</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {loading ? (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar size={32} className="text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              </div>
            ) : (
              events.map((e) => (
                <div
                  key={e.id}
                  className="group rounded-xl border p-4 transition-all hover:bg-muted/30 hover:border-amber-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{e.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(e.startsAt).toLocaleDateString()} &middot; {e.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      {isLeaderOrAdmin && (
        <div className="animate-slide-up delay-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Admin Tools
            </h2>
          </div>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setModal("material")} className="gap-2">
                  <FileText size={18} />
                  Upload Material
                </Button>
                <Button onClick={() => setModal("announcement")} variant="soft-secondary" className="gap-2">
                  <Megaphone size={18} />
                  Post Announcement
                </Button>
                <Button onClick={() => setModal("event")} variant="soft" className="gap-2">
                  <Calendar size={18} />
                  Create Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      <UploadMaterialModal
        open={modal === "material"}
        onClose={() => setModal(null)}
        onSuccess={() => setReloadKey((k) => k + 1)}
      />
      <PostAnnouncementModal
        open={modal === "announcement"}
        onClose={() => setModal(null)}
        onSuccess={() => setReloadKey((k) => k + 1)}
      />
      <CreateEventModal
        open={modal === "event"}
        onClose={() => setModal(null)}
        onSuccess={() => setReloadKey((k) => k + 1)}
      />
    </div>
  )
}