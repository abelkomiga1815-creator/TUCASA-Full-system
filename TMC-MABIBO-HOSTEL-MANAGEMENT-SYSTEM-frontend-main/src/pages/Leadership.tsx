import { useEffect, useState } from "react"
import { Building2, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { imageUrl } from "@/utils/imageUrl"
import { leadershipApi } from "@/api/endpoints/leadership"
import { Position } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function Leadership() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    leadershipApi.getCurrent()
      .then(setPositions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const getPositionsByLevel = (level: number) => positions.filter((p) => p.level === level)
  const maxLevel = positions.length > 0 ? Math.max(...positions.map((p) => p.level)) : 0

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }, (_, i) => i + 1).map((level) => (
            <div key={level} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="mt-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Failed to load leadership structure: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Current Leadership Structure</h1>
        <p className="text-muted-foreground">
          Leadership team for the current regime
        </p>
      </div>

      <div className="space-y-6">
        {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => {
          const levelPositions = getPositionsByLevel(level)
          if (levelPositions.length === 0) return null

          return (
            <div key={level} className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Crown size={20} className="text-primary" />
                Level {level}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {levelPositions.map((position) => (
                  <Card key={position.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 flex-shrink-0">
                          <AvatarImage src={imageUrl(position.leader?.profilePicUrl)} alt={position.leader ? `${position.leader.firstName} ${position.leader.lastName}` : "Vacant"} />
                          <AvatarFallback className="text-lg">
                            {position.leader
                              ? `${position.leader.firstName[0]}${position.leader.lastName[0]}`
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{position.name}</h3>
                            {position.departmentTag && (
                              <Badge variant="secondary" className="text-xs">
                                {position.departmentTag}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{position.description}</p>
                          {position.leader ? (
                            <p className="mt-2 font-medium">
                              {position.leader.firstName} {position.leader.lastName}
                            </p>
                          ) : (
                            <Badge variant="destructive" className="mt-2">
                              Vacant
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {position.responsibilities}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Card className="bg-slate-50 border-dashed dark:bg-muted/30">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Building2 size={32} className="mx-auto mb-2 opacity-50" />
          <p>Vacant positions are not displayed in the public view.</p>
          <p className="mt-1">Contact the Chaplain's office for more information.</p>
        </CardContent>
      </Card>
    </div>
  )
}