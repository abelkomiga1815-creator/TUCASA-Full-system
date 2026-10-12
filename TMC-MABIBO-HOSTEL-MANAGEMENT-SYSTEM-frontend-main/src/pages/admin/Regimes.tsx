import { useEffect, useState } from "react"
import { Plus, Calendar, Edit, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { leadershipApi } from "@/api/endpoints/leadership"
import { Regime, RegimeRequest } from "@/types"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminRegimes() {
  const [regimes, setRegimes] = useState<Regime[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState<RegimeRequest>({
    name: "",
    startDate: "",
    endDate: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    leadershipApi.getRegimes()
      .then(setRegimes)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  const hasActiveRegime = regimes.some((r) => r.isActive)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await leadershipApi.createRegime(formData)
      toast.success("Regime created")
      setShowCreate(false)
      setFormData({ name: "", startDate: "", endDate: "" })
      leadershipApi.getRegimes().then(setRegimes)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create regime")
    } finally {
      setSubmitting(false)
    }
  }

  const handleActivate = async (id: number) => {
    if (!confirm("Set this regime as active? This will archive the current active regime.")) return
    try {
      await leadershipApi.activateRegime(id)
      toast.success("Regime activated")
      leadershipApi.getRegimes().then(setRegimes)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to activate regime")
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
          <h1 className="text-3xl font-bold text-primary">Manage Regimes</h1>
          <p className="text-muted-foreground">Manage leadership terms (academic years)</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button onClick={() => { setFormData({ name: "", startDate: "", endDate: "" }); setShowCreate(true); }}>
              <Plus size={16} className="mr-2" />
              Create Regime
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Regime?</AlertDialogTitle>
              <AlertDialogDescription>
                {hasActiveRegime ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-destructive mr-2 inline" />
                    This will archive the current active regime. This action cannot be undone.
                  </>
                ) : (
                  "A new regime will be created. Only one regime can be active at a time."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowCreate(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setShowCreate(true)}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {showCreate && (
        <Card className="border-primary" onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Create New Regime</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    placeholder="e.g., 2026/2027"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Regime"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {regimes.map((regime) => (
          <Card key={regime.id} className={regime.isActive ? "border-primary" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{regime.name}</h3>
                      {regime.isActive && <Badge variant="default">Active</Badge>}
                      {!regime.isActive && <Badge variant="secondary">Archived</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(regime.startDate).toLocaleDateString()} — {new Date(regime.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!regime.isActive && (
                    <Button variant="ghost" size="icon">
                      <Edit size={16} />
                    </Button>
                  )}
                  {!regime.isActive && (
                    <Button variant="ghost" size="icon" onClick={() => handleActivate(regime.id)}>
                      Set Active
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-50 border-dashed dark:bg-muted/30">
        <CardContent className="p-6">
          <h4 className="font-medium flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
            Important Notes
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Only one regime can be active at a time</li>
            <li>Creating a new regime while one is active will archive the current regime</li>
            <li>Archiving is a one-way operation and cannot be reversed</li>
            <li>All leadership assignments are tied to a specific regime</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}