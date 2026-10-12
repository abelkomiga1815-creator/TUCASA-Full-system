import { useEffect, useState } from "react"
import { toast } from "sonner"
import { adminApi } from "@/api/endpoints/admin"
import { permissionsApi } from "@/api/endpoints/permissions"
import { User, LeaderPermissionRequest } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmModal } from "@/components/modals/ConfirmModal"
import { Shield, Loader2, Check } from "lucide-react"

type PendingAction = { type: "baptize" | "graduate" | "role"; user: User; newRole?: string } | null

interface PermissionModalProps {
  open: boolean
  user: User | null
  onClose: () => void
}

function PermissionModal({ open, user, onClose }: PermissionModalProps) {
  if (!open || !user) return null

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<LeaderPermissionRequest>({
    canUploadMaterials: false,
    canPostAnnouncements: false,
    canCreateEvents: false,
  })

  useEffect(() => {
    if (user) {
      setLoading(true)
      permissionsApi.getPermissions(user.id)
        .then((p) => {
          setFormData({
            canUploadMaterials: p.canUploadMaterials,
            canPostAnnouncements: p.canPostAnnouncements,
            canCreateEvents: p.canCreateEvents,
          })
        })
        .catch(() => toast.error("Failed to load permissions"))
        .finally(() => setLoading(false))
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await permissionsApi.updatePermissions(user.id, formData)
      toast.success("Permissions updated")
      onClose()
    } catch {
      toast.error("Failed to update permissions")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: "canUploadMaterials" | "canPostAnnouncements" | "canCreateEvents", value: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="fixed inset-0" onClick={onClose} />
      <Card className="w-full max-w-md relative z-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Permissions for {user.firstName} {user.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Grant or revoke specific permissions for this leader.
          </p>
          <div className="space-y-3">
            {([
              { key: "canUploadMaterials", label: "Upload Spiritual Materials", desc: "Can upload sermons, Bible studies, songs, etc." },
              { key: "canPostAnnouncements", label: "Post Announcements", desc: "Can create and publish announcements" },
              { key: "canCreateEvents", label: "Create Events", desc: "Can create and manage events" },
            ] as const).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[key as keyof LeaderPermissionRequest]}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="sr-only peer"
                    disabled={saving}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <>Save <Check size={16} className="ml-2" /></>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<PendingAction>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [permissionUser, setPermissionUser] = useState<User | null>(null)

  const [exportAllModalOpen, setExportAllModalOpen] = useState(false)
  const [exportAllModalLoading, setExportAllModalLoading] = useState(false)

  const loadUsers = (p: number) => {
    setLoading(true)
    adminApi
      .getMembers(p, 10)
      .then((res) => {
        setUsers(res.content)
        setTotalPages(res.totalPages)
      })
      .catch(() => toast.error("Could not load members"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers(page)
  }, [page])

  const confirmAction = async () => {
    if (!pending) return
    setActionLoading(true)
    try {
      if (pending.type === "baptize") {
        await adminApi.baptize(pending.user.id)
        toast.success(`${pending.user.firstName} marked as baptized`)
      } else if (pending.type === "graduate") {
        await adminApi.graduate(pending.user.id)
        toast.success(`${pending.user.firstName} moved to alumni`)
      } else if (pending.type === "role" && pending.newRole) {
        await adminApi.promoteDemote(pending.user.id, pending.newRole)
        toast.success(`${pending.user.firstName}'s role updated`)
      }
      loadUsers(page)
    } catch {
      toast.error("Action failed")
    } finally {
      setActionLoading(false)
      setPending(null)
    }
  }

  const handleExportAllConfirm = async () => {
    setExportAllModalLoading(true)
    try {
      await adminApi.exportAllMembers()
      toast.success("All members exported successfully")
    } catch {
      toast.error("Export all members failed")
    } finally {
      setExportAllModalLoading(false)
      setExportAllModalOpen(false)
    }
  }

  const nextRole = (role: string) => (role === "MEMBER" ? "LEADER" : "MEMBER")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">User management</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Email</th>
                  <th className="py-2 pr-2">Year</th>
                  <th className="py-2 pr-2">Role</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2 pr-2">{u.firstName} {u.lastName}</td>
                    <td className="py-2 pr-2">{u.email}</td>
                    <td className="py-2 pr-2">{u.yearOfStudy}</td>
                    <td className="py-2 pr-2">
                      <Badge variant="outline">{u.role}</Badge>
                    </td>
                    <td className="py-2 pr-2">
                      <Badge variant={u.status === "ACTIVE" ? "success" : "outline"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="flex flex-wrap gap-2 py-2">
                      {u.role !== "ADMIN" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPending({ type: "role", user: u, newRole: nextRole(u.role) })}
                        >
                          {u.role === "MEMBER" ? "Promote" : "Demote"}
                        </Button>
                      )}
                      {!u.isBaptized && (
                        <Button size="sm" variant="outline" onClick={() => setPending({ type: "baptize", user: u })}>
                          Baptize
                        </Button>
                      )}
                      {u.status === "ACTIVE" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setPending({ type: "graduate", user: u })}
                        >
                          Graduate
                        </Button>
                      )}
                      {u.role === "LEADER" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPermissionUser(u)}
                        >
                          Permissions
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <Button
        size="sm"
        variant="outline"
        onClick={() => setExportAllModalOpen(true)}
        disabled={exportAllModalLoading}
      >
        Export All Members to Excel
      </Button>
      <ConfirmModal
        open={pending?.type === "baptize"}
        title="Confirm baptism update"
        description="This action is permanent and cannot be undone. Confirm?"
        confirmLabel="Baptize"
        loading={actionLoading}
        onConfirm={confirmAction}
        onCancel={() => setPending(null)}
      />
      <ConfirmModal
        open={pending?.type === "graduate"}
        title="Confirm graduation"
        description="This will archive this member as Alumni. They will lose access to semester updates. Confirm?"
        confirmLabel="Graduate"
        variant="destructive"
        loading={actionLoading}
        onConfirm={confirmAction}
        onCancel={() => setPending(null)}
      />
      <ConfirmModal
        open={pending?.type === "role"}
        title="Confirm role change"
        description={`Change ${pending?.user.firstName ?? "this member"}'s role to ${pending?.newRole ?? ""}?`}
        confirmLabel="Update role"
        loading={actionLoading}
        onConfirm={confirmAction}
        onCancel={() => setPending(null)}
      />

      <ConfirmModal
        open={!!exportAllModalOpen}
        title="Export All Members"
        description="Are you sure you want to export all eligible members' details to one Excel file?"
        confirmLabel="Export All"
        loading={exportAllModalLoading}
        onConfirm={handleExportAllConfirm}
        onCancel={() => setExportAllModalOpen(false)}
      />

      <PermissionModal
        open={!!permissionUser}
        user={permissionUser}
        onClose={() => setPermissionUser(null)}
      />
    </Card>
  )
}