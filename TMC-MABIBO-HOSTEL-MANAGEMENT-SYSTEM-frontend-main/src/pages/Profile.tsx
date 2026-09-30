import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function Profile() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="mx-auto max-w-xl px-4 py-6 pb-20 sm:pb-6">
      <Card>
        <CardHeader>
          <CardTitle>{user.firstName} {user.lastName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
          <p><span className="text-muted-foreground">Phone:</span> {user.phone}</p>
          <p><span className="text-muted-foreground">Program:</span> {user.program}</p>
          <p><span className="text-muted-foreground">Year of study:</span> {user.yearOfStudy}</p>
          <p><span className="text-muted-foreground">Home region:</span> {user.homeRegion}</p>
          <p><span className="text-muted-foreground">Home church:</span> {user.homeChurch}</p>
          <p><span className="text-muted-foreground">Talent:</span> {user.talent || "—"}</p>
          <p>
            <Badge variant={user.isBaptized ? "success" : "outline"}>
              {user.isBaptized ? "Baptized" : "Not baptized"}
            </Badge>
          </p>
          <Link to="/update-semester">
            <Button variant="outline" className="mt-2">Update semester info</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
