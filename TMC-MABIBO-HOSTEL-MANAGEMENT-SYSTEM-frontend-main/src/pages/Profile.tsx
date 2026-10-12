import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { imageUrl } from "@/utils/imageUrl"
import { ProfileCropper } from "@/components/modals/ProfileCropper"
import { Camera } from "lucide-react"

export default function Profile() {
  const { user, updateProfilePicture } = useAuth()
  const [cropperOpen, setCropperOpen] = useState(false)

  if (!user) return null

  const handleSavePhoto = async (file: File) => {
    await updateProfilePicture(file)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 pb-20 sm:pb-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage src={imageUrl(user.profilePicUrl)} alt={user.firstName} />
                <AvatarFallback className="text-2xl font-medium">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground shadow-medium"
                onClick={() => setCropperOpen(true)}
                aria-label="Change profile photo"
              >
                <Camera size={16} />
              </Button>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl">{user.firstName} {user.lastName}</CardTitle>
              <p className="text-sm text-muted-foreground capitalize">{user.role?.toLowerCase()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
              <p className="font-medium truncate">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
              <p className="font-medium">{user.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Program</p>
              <p className="font-medium">{user.program}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Year</p>
              <p className="font-medium">Year {user.yearOfStudy}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Home Region</p>
              <p className="font-medium">{user.homeRegion}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Home Church</p>
              <p className="font-medium">{user.homeChurch}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Talent</p>
              <p className="font-medium">{user.talent || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Baptism Status</p>
              <p className="font-medium">
                <Badge variant={user.isBaptized ? "success" : "outline"}>
                  {user.isBaptized ? "Baptized" : "Not baptized"}
                </Badge>
              </p>
            </div>
          </div>
          <Link to="/update-semester">
            <Button variant="outline" className="mt-4 w-full">Update semester info</Button>
          </Link>
        </CardContent>
      </Card>

      <ProfileCropper
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        onSave={handleSavePhoto}
      />
    </div>
  )
}
