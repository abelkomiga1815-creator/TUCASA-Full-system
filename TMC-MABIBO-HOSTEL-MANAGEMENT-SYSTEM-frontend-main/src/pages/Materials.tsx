import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { memberApi } from "@/api/endpoints/member"
import { permissionsApi } from "@/api/endpoints/permissions"
import { Material } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

export default function Materials() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [canUpload, setCanUpload] = useState(false)
  const [permLoading, setPermLoading] = useState(true)

  useEffect(() => {
    memberApi
      .getMaterials()
      .then(setMaterials)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (user?.role === "LEADER") {
      permissionsApi.getPermissions(user.id)
        .then((p) => setCanUpload(p.canUploadMaterials))
        .catch(() => setCanUpload(false))
        .finally(() => setPermLoading(false))
    } else if (user?.role === "ADMIN") {
      setCanUpload(true)
      setPermLoading(false)
    } else {
      setPermLoading(false)
    }
  }, [user])

  const showUploadButton = user?.role === "ADMIN" || (user?.role === "LEADER" && canUpload)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-20 sm:pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="mb-4 text-2xl font-semibold">Spiritual materials</h1>
        {showUploadButton && (
          <Button onClick={() => window.location.href = "/materials/upload"}>
            <Plus size={16} className="mr-2" />
            Upload Material
          </Button>
        )}
        {user?.role === "LEADER" && permLoading && !canUpload && (
          <Button disabled>
            <Upload size={16} className="mr-2 animate-spin" />
            Checking permissions...
          </Button>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : materials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No materials have been uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {materials.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="text-base">{m.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{m.description}</p>
                <a href={m.fileUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}