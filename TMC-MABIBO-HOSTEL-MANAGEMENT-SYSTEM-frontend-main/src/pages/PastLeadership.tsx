import { useEffect, useState } from "react"
import { Calendar, Users, ChevronDown, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { imageUrl } from "@/utils/imageUrl"
import { leadershipApi } from "@/api/endpoints/leadership"
import { Regime } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function PastLeadership() {
  const [regimes, setRegimes] = useState<Regime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRegime, setExpandedRegime] = useState<number | null>(null)

  useEffect(() => {
    leadershipApi.getPast()
      .then((data) => {
        setRegimes(data)
        if (data.length > 0) {
          setExpandedRegime(data[0].id)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Failed to load past leadership: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Past Leadership</h1>
        <p className="text-muted-foreground">
          Historical record of leadership teams by academic year
        </p>
      </div>

      <div className="space-y-4">
        {regimes.map((regime) => (
          <Card key={regime.id}>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedRegime(expandedRegime === regime.id ? null : regime.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar size={24} className="text-primary" />
                  <div>
                    <h3 className="font-semibold">{regime.name} Academic Year</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(regime.startDate).toLocaleDateString()} — {new Date(regime.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{regime.leaders?.length ?? 0} Leaders</Badge>
                  {expandedRegime === regime.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>
            </CardHeader>
            {expandedRegime === regime.id && regime.leaders && (
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
                  {regime.leaders
                    .sort((a, b) => a.level - b.level)
                    .map((leader) => (
                      <div
                        key={leader.positionId}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg dark:bg-muted/30"
                      >
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={imageUrl(leader.leader?.profilePicUrl)} alt={leader.leader ? `${leader.leader.firstName} ${leader.leader.lastName}` : "Leader"} />
                          <AvatarFallback className="text-base">
                            {leader.leader
                              ? `${leader.leader.firstName[0]}${leader.leader.lastName[0]}`
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {leader.leader ? `${leader.leader.firstName} ${leader.leader.lastName}` : "Vacant"}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{leader.positionName}</p>
                          {leader.departmentTag && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {leader.departmentTag}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">Level {leader.level}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="bg-slate-50 border-dashed dark:bg-muted/30">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Users size={32} className="mx-auto mb-2 opacity-50" />
          <p className="font-medium">Immutable Historical Records</p>
          <p className="mt-1 text-sm">
            Past leadership records are archived and cannot be modified once a regime is closed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}