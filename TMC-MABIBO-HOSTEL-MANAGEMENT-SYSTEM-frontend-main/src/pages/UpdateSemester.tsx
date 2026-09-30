import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import axios from "axios"
import { useAuth } from "@/hooks/useAuth"
import { memberApi } from "@/api/endpoints/member"
import { SemesterUpdateFormValues, semesterUpdateSchema } from "@/utils/validators"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function UpdateSemester() {
  const { user, refreshUser, markSemesterUpdated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SemesterUpdateFormValues>({
    resolver: zodResolver(semesterUpdateSchema),
    defaultValues: {
      yearOfStudy: user?.yearOfStudy ?? 1,
      phone: user?.phone ?? "",
      talent: user?.talent ?? ""
    }
  })

  const onSubmit = async (values: SemesterUpdateFormValues) => {
    setLoading(true)
    try {
      const updated = await memberApi.updateSemester(values)
      refreshUser(updated)
      markSemesterUpdated()
      toast.success("Semester update saved")
      navigate("/dashboard")
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined
      toast.error(message ?? "Could not save your update")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-xl px-4 py-6 pb-20 sm:pb-6">
      <Card>
        <CardHeader>
          <CardTitle>Semester update</CardTitle>
          <CardDescription>Confirm your details for the current semester.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First name</Label>
                <Input value={user.firstName} disabled readOnly />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={user.lastName} disabled readOnly />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user.email} disabled readOnly />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Home region</Label>
                <Input value={user.homeRegion} disabled readOnly />
              </div>
              <div>
                <Label>Home church</Label>
                <Input value={user.homeChurch} disabled readOnly />
              </div>
            </div>
            <div>
              <Label>Baptized status</Label>
              <div>
                <Badge variant={user.isBaptized ? "success" : "outline"}>
                  {user.isBaptized ? "Baptized" : "Not baptized"}
                </Badge>
              </div>
              {!user.isBaptized && (
                <p className="mt-2 text-xs text-muted-foreground">
                  If you have been recently baptized, please contact your Admin to update your status.
                </p>
              )}
            </div>

            <hr />

            <div>
              <Label htmlFor="yearOfStudy">Year of study</Label>
              <Select id="yearOfStudy" {...register("yearOfStudy")}>
                {[1, 2, 3, 4, 5, 6, 7].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div>
              <Label htmlFor="talent">Talent (optional)</Label>
              <Input id="talent" {...register("talent")} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save semester update"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
