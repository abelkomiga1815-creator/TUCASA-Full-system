import { useEffect, useState } from "react"
import { Plus, Crown, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { leadershipApi } from "@/api/endpoints/leadership"
import { Position, PositionRequest } from "@/types"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPositions() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<PositionRequest>({
    name: "",
    description: "",
    responsibilities: "",
    level: 1,
    departmentTag: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    leadershipApi.getPositions()
      .then(setPositions)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await leadershipApi.updatePosition(editingId, formData)
        toast.success("Position updated")
      } else {
        await leadershipApi.createPosition(formData)
        toast.success("Position created")
      }
      setShowCreate(false)
      setEditingId(null)
      setFormData({ name: "", description: "", responsibilities: "", level: 1, departmentTag: "" })
      try {
        const updated = await leadershipApi.getPositions()
        setPositions(updated)
      } catch (refreshErr) {
        // Creation succeeded; silence refresh failure
        console.warn("Position created but list refresh failed:", refreshErr)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Operation failed")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetire = async (id: number) => {
    if (!confirm("Retire this position? This action cannot be undone if there are active assignments.")) return
    try {
      await leadershipApi.retirePosition(id)
      toast.success("Position retired")
      leadershipApi.getPositions().then(setPositions)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to retire position")
    }
  }

  const handleEdit = (position: Position) => {
    setEditingId(position.id)
    setFormData({
      name: position.name,
      description: position.description ?? "",
      responsibilities: position.responsibilities ?? "",
      level: position.level,
      departmentTag: position.departmentTag ?? "",
    })
    setShowCreate(true)
  }

  const handleCancel = () => {
    setShowCreate(false)
    setEditingId(null)
    setFormData({ name: "", description: "", responsibilities: "", level: 1, departmentTag: "" })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Manage Positions</h1>
          <p className="text-muted-foreground">Define and manage leadership positions</p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: "", description: "", responsibilities: "", level: 1, departmentTag: "" }); setShowCreate(true); }}>
          <Plus size={16} className="mr-2" />
          Create Position
        </Button>
      </div>

      {showCreate && (
        <Card className="border-primary" onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Position" : "Create New Position"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    placeholder="e.g., Hostel Chaplain"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Level *</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Department Tag (optional)</label>
                  <Input
                    placeholder="e.g., Worship, Discipleship, Outreach"
                    value={formData.departmentTag}
                    onChange={(e) => setFormData({ ...formData, departmentTag: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  placeholder="Brief description of the position"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsibilities</label>
                <Input
                  placeholder="Key responsibilities..."
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {positions.map((position) => (
          <Card key={position.id} className={position.isRetired ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Crown size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{position.name}</h3>
                      {position.departmentTag && (
                        <Badge variant="secondary" className="text-xs">{position.departmentTag}</Badge>
                      )}
                      {position.isRetired && <Badge variant="destructive" className="text-xs">Retired</Badge>}
                      <Badge variant="outline" className="text-xs">Level {position.level}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{position.description}</p>
                    {position.responsibilities && <p className="text-xs text-muted-foreground mt-1">{position.responsibilities}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!position.isRetired && (
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(position)}>
                      <Edit size={16} />
                    </Button>
                  )}
                  {!position.isRetired && (
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleRetire(position.id)}>
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}