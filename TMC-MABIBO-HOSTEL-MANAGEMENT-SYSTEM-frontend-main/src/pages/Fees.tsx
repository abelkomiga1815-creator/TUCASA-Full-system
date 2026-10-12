import { useEffect, useState } from "react"
import { Wallet, CheckCircle2, Clock, Ban } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { feesApi } from "@/api/endpoints/fees"
import { MembershipFee } from "@/types"
import { toast } from "sonner"

function statusBadge(status: string) {
  switch (status) {
    case "PAID":
      return <Badge variant="success"><CheckCircle2 size={12} className="mr-1" /> Paid</Badge>
    case "WAIVED":
      return <Badge variant="outline"><Ban size={12} className="mr-1" /> Waived</Badge>
    default:
      return <Badge variant="warning"><Clock size={12} className="mr-1" /> Pending</Badge>
  }
}

export default function Fees() {
  const [fees, setFees] = useState<MembershipFee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    feesApi
      .myFees()
      .then(setFees)
      .catch(() => toast.error("Failed to load your fee records"))
      .finally(() => setLoading(false))
  }, [])

  const paidThisSemester = fees.some((f) => f.status === "PAID")

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">My Fees</h1>
        <p className="text-muted-foreground">Your membership fee history and current status</p>
      </div>

      <Card className={paidThisSemester ? "border-green-200 bg-green-50/50 dark:border-green-800/60 dark:bg-green-900/20" : "border-amber-200 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-900/20"}>
        <CardContent className="flex items-center gap-4 p-5">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${paidThisSemester ? "bg-green-500/15 text-green-700 dark:text-green-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>
            <Wallet size={24} />
          </div>
          <div>
            <p className="font-semibold">
              {loading ? "Checking status..." : paidThisSemester ? "Active member — fee paid" : "Payment pending"}
            </p>
            <p className="text-sm text-muted-foreground">
              {loading
                ? ""
                : paidThisSemester
                  ? "Thank you! Your membership is active for the current semester."
                  : "Please pay your membership fee. Contact an admin to confirm your payment."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee history</CardTitle>
          <CardDescription>All your membership fee records, newest first</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : fees.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No fee records yet. An admin will create one for you.
            </p>
          ) : (
            <div className="space-y-3">
              {fees.map((fee) => (
                <div key={fee.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                  <div>
                    <p className="font-semibold">
                      {Number(fee.amount).toLocaleString()} {fee.currency}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {fee.semester?.name ?? "No semester"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fee.paymentMethod ?? "No method"}{fee.referenceNumber ? ` · Ref: ${fee.referenceNumber}` : ""}
                      {fee.paidAt ? ` · Paid ${new Date(fee.paidAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  {statusBadge(fee.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
