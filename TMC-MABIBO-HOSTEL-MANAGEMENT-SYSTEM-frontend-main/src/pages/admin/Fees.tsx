import { useEffect, useState } from "react"
import { Plus, Users, Check, X, Eye, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { feesApi } from "@/api/endpoints/fees"
import { adminApi } from "@/api/endpoints/admin"
import { MembershipFee, User } from "@/types"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils/cn"

type StatusFilter = "ALL" | "PENDING" | "PAID" | "WAIVED"

const PAYMENT_METHODS = ["CASH", "MPESA", "TIGO_PESA", "AIRTEL_MONEY", "BANK"]

function statusBadge(status: string) {
  switch (status) {
    case "PAID":
      return <Badge variant="success">Paid</Badge>
    case "WAIVED":
      return <Badge variant="outline">Waived</Badge>
    default:
      return <Badge variant="warning">Pending</Badge>
  }
}

export default function AdminFees() {
  const [fees, setFees] = useState<MembershipFee[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<StatusFilter>("ALL")
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [semesters, setSemesters] = useState<{ id: number; name: string; isActive: boolean }[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ userId: "", semesterId: "", amount: "", currency: "TZS", paymentMethod: "", referenceNumber: "", notes: "" })
  const [bulkForm, setBulkForm] = useState({ semesterId: "", amount: "", currency: "TZS", notes: "" })

  const load = (p = page, f = filter) => {
    setLoading(true)
    feesApi
      .list({ status: f === "ALL" ? undefined : f, page: p, size: 10 })
      .then((res) => {
        setFees(res.content)
        setTotalPages(res.totalPages)
      })
      .catch(() => toast.error("Failed to load fee records"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    adminApi.getMembers(0, 200).then((res) => setUsers(res.content)).catch(() => {})
    feesApi.semesters().then(setSemesters).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPage(0)
    load(0, filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const refresh = () => load()

  const handleConfirm = async (id: number) => {
    try {
      await feesApi.confirm(id)
      toast.success("Payment confirmed — member is now active")
      refresh()
    } catch {
      toast.error("Failed to confirm payment")
    }
  }

  const handleWaive = async (id: number) => {
    if (!confirm("Waive this fee? The member will NOT be counted as active.")) return
    try {
      await feesApi.waive(id)
      toast.success("Fee waived")
      refresh()
    } catch {
      toast.error("Failed to waive fee")
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await feesApi.create({
        userId: parseInt(form.userId),
        semesterId: form.semesterId ? parseInt(form.semesterId) : undefined,
        amount: parseFloat(form.amount),
        currency: form.currency || undefined,
        paymentMethod: form.paymentMethod || undefined,
        referenceNumber: form.referenceNumber || undefined,
        notes: form.notes || undefined,
      })
      toast.success("Fee record created (Pending)")
      setShowCreate(false)
      setForm({ userId: "", semesterId: "", amount: "", currency: "TZS", paymentMethod: "", referenceNumber: "", notes: "" })
      refresh()
    } catch {
      toast.error("Failed to create fee record")
    } finally {
      setSubmitting(false)
    }
  }

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await feesApi.bulkCreate({
        semesterId: parseInt(bulkForm.semesterId),
        amount: parseFloat(bulkForm.amount),
        currency: bulkForm.currency || undefined,
        notes: bulkForm.notes || undefined,
      })
      toast.success(`Created ${res.created} pending fee record(s)`)
      setShowBulk(false)
      setBulkForm({ semesterId: "", amount: "", currency: "TZS", notes: "" })
      refresh()
    } catch {
      toast.error("Bulk create failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary">Membership Fees</h1>
          <p className="text-muted-foreground">Track payments — confirming a fee activates the member</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulk((v) => !v)}>
            <Layers size={16} className="mr-2" />
            Bulk create
          </Button>
          <Button onClick={() => setShowCreate((v) => !v)}>
            <Plus size={16} className="mr-2" />
            New fee record
          </Button>
        </div>
      </div>

      {showBulk && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Bulk create pending fees</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulk} className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Semester *</label>
                <Select value={bulkForm.semesterId} onChange={(e) => setBulkForm({ ...bulkForm, semesterId: e.target.value })} required>
                  <option value="">Select semester</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{s.isActive ? " (active)" : ""}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Amount (TZS) *</label>
                <Input type="number" min="0.01" step="0.01" value={bulkForm.amount} onChange={(e) => setBulkForm({ ...bulkForm, amount: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Currency</label>
                <Input value={bulkForm.currency} onChange={(e) => setBulkForm({ ...bulkForm, currency: e.target.value })} />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create for all members"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowBulk(false)}>Cancel</Button>
              </div>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">Creates PENDING records only for active members without one for the semester.</p>
          </CardContent>
        </Card>
      )}

      {showCreate && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>New fee record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Member *</label>
                <Select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required>
                  <option value="">Select member</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Semester</label>
                <Select value={form.semesterId} onChange={(e) => setForm({ ...form, semesterId: e.target.value })}>
                  <option value="">Active semester (default)</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{s.isActive ? " (active)" : ""}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Amount *</label>
                <Input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Currency</label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Payment method</label>
                <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option value="">—</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Reference number</label>
                <Input value={form.referenceNumber} onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })} />
              </div>
              <div className="md:col-span-3">
                <label className="mb-1 block text-sm font-medium">Notes</label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-2 md:col-span-3">
                <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Create record"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {(["ALL", "PENDING", "PAID", "WAIVED"] as StatusFilter[]).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : fees.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No fee records found for this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {fees.map((fee) => (
            <Card key={fee.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">{fee.user.firstName} {fee.user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{fee.user.email}</p>
                      <p className="mt-1 text-sm">
                        {Number(fee.amount).toLocaleString()} {fee.currency}
                        <span className="text-muted-foreground"> &middot; {fee.semester?.name ?? "No semester"}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fee.paymentMethod ?? "No method"}{fee.referenceNumber ? ` · Ref: ${fee.referenceNumber}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(fee.status)}
                    <Button variant="ghost" size="icon" title="View details" onClick={() => setExpandedId(expandedId === fee.id ? null : fee.id)}>
                      <Eye size={16} />
                    </Button>
                    {fee.status === "PENDING" && (
                      <>
                        <Button size="sm" onClick={() => handleConfirm(fee.id)}>
                          <Check size={14} className="mr-1" /> Confirm
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleWaive(fee.id)}>
                          <X size={14} className="mr-1" /> Waive
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {expandedId === fee.id && (
                  <div className={cn("mt-3 rounded-lg bg-muted/50 p-3 text-sm")}>
                    <p><span className="font-medium">Created:</span> {new Date(fee.createdAt).toLocaleString()}</p>
                    {fee.paidAt && <p><span className="font-medium">Paid at:</span> {new Date(fee.paidAt).toLocaleString()}</p>}
                    {fee.confirmedBy && <p><span className="font-medium">Confirmed by:</span> {fee.confirmedBy.firstName} {fee.confirmedBy.lastName}{fee.confirmedAt ? ` on ${new Date(fee.confirmedAt).toLocaleString()}` : ""}</p>}
                    {fee.notes && <p><span className="font-medium">Notes:</span> {fee.notes}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button size="sm" variant="outline" disabled={page === 0} onClick={() => { setPage(page - 1); load(page - 1); }}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page + 1} of {Math.max(1, totalPages)}</span>
        <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => { setPage(page + 1); load(page + 1); }}>
          Next
        </Button>
      </div>
    </div>
  )
}
