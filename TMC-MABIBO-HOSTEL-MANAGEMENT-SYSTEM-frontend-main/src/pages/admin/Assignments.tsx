import { useEffect, useState } from "react"
import { Plus, Users, Edit, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { leadershipApi } from "@/api/endpoints/leadership"
import { Assignment, AssignmentRequest, Position, Regime } from "@/types"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { User } from "@/types"

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [regimes, setRegimes] = useState<Regime[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState<AssignmentRequest>({
    userId: 0,
    positionId: 0,
    regimeId: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      leadershipApi.getAssignments(),
      leadershipApi.getPositions(),
      leadershipApi.getRegimes(),
    ])
      .then(([assignmentsRes, positionsRes, regimesRes]) => {
        setAssignments(assignmentsRes)
        setPositions(positionsRes.filter(p => !p.isRetired))
        setRegimes(regimesRes)
        // Fetch users - we'll need a users endpoint, for now use assignments data
        const uniqueUsers = new Map<number, User>()
        assignmentsRes.forEach(a => {
          if (a.user) uniqueUsers.set(a.user.id, a.user)
        })
        setUsers(Array.from(uniqueUsers.values()))
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await leadershipApi.createAssignment(formData)
      toast.success("Assignment created")
      setShowCreate(false)
      setFormData({ userId: 0, positionId: 0, regimeId: 0 })
      leadershipApi.getAssignments().then(setAssignments)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create assignment")
    } finally {
      setSubmitting(false)
    }
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
          <h1 className="text-3xl font-bold text-primary">Manage Assignments</h1>
          <p className="text-muted-foreground">Assign users to leadership positions per regime</p>
        </div>
        <Button onClick={() => { setFormData({ userId: 0, positionId: 0, regimeId: 0 }); setShowCreate(true); }}>
          <Plus size={16} className="mr-2" />
          New Assignment
        </Button>
      </div>

      {showCreate && (
        <Card className="border-primary" onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-1">User *</label>
                  <Select
                    value={formData.userId.toString()}
                    onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                    required
                  >
                    <option value="">Select user</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id.toString()}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position *</label>
                  <Select
                    value={formData.positionId.toString()}
                    onChange={(e) => setFormData({ ...formData, positionId: parseInt(e.target.value) })}
                    required
                  >
                    <option value="">Select position</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.id.toString()}>
                        {p.name} (Level {p.level})
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Regime *</label>
                  <Select
                    value={formData.regimeId.toString()}
                    onChange={(e) => setFormData({ ...formData, regimeId: parseInt(e.target.value) })}
                    required
                  >
                    <option value="">Select regime</option>
                    {regimes.map((r) => (
                      <option key={r.id} value={r.id.toString()}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Assigning..." : "Assign"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className={assignment.isCurrent ? "border-primary" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{assignment.user.firstName} {assignment.user.lastName}</h3>
                      <Badge variant="outline" className="text-xs">Level {assignment.position.level}</Badge>
                      {assignment.isCurrent && <Badge variant="default" className="text-xs">Current</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{assignment.position.name} — {assignment.regime.name}</p>
                    <p className="text-xs text-muted-foreground">Assigned: {new Date(assignment.assignedAt).toLocaleDateString()} by {assignment.assignedBy.firstName} {assignment.assignedBy.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <UserCheck size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}