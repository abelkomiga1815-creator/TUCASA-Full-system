import { useEffect, useState } from "react"
import { adminApi } from "@/api/endpoints/admin"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import UserManagement from "./UserManagement"
import AlumniSearch from "./AlumniSearch"

const PIE_COLORS = ["#15803D", "#94A3B8"]

export default function AdminPanel() {
  const [analytics, setAnalytics] = useState<{
    totalMembers: number
    activeMembers: number
    baptizedCount: number
    pendingFeesCount: number
    membersByYear: Record<string, number>
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .getAnalytics()
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:pb-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin panel</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total members</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-semibold">{analytics?.totalMembers}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Active members</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-semibold">{analytics?.activeMembers}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Pending fees</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-semibold">{analytics?.pendingFeesCount ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Baptized vs not</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Baptized", value: analytics?.baptizedCount ?? 0 },
                      { name: "Not baptized", value: Math.max(0, (analytics?.totalMembers ?? 0) - (analytics?.baptizedCount ?? 0)) }
                    ]}
                    dataKey="value"
                    innerRadius={30}
                    outerRadius={55}
                  >
                    {PIE_COLORS.map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Members by year</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={Object.entries(analytics?.membersByYear ?? {}).map(([year, count]) => ({ year, count }))}>
                  <XAxis dataKey="year" tickFormatter={(y) => `Y${y}`} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <UserManagement />
        <AlumniSearch />
      </div>
    </div>
  )
}
