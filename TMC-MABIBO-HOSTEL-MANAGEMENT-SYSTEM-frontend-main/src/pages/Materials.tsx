import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { memberApi } from "@/api/endpoints/member"
import { permissionsApi } from "@/api/endpoints/permissions"
import { Material, PaginatedResponse } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus, Upload, ChevronLeft, ChevronRight } from "lucide-react"

export default function Materials() {
  const { user } = useAuth()
  const [data, setData] = useState<PaginatedResponse<Material> | null>(null)
  const [loading, setLoading] = useState(true)
  const [canUpload, setCanUpload] = useState(false)
  const [permLoading, setPermLoading] = useState(true)
  const [page, setPage] = useState(0)

  const materials = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  useEffect(() => {
    setLoading(true)
    memberApi
      .getMaterials(10, page)
      .then(setData)
      .finally(() => setLoading(false))
  }, [page])

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
        <>
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