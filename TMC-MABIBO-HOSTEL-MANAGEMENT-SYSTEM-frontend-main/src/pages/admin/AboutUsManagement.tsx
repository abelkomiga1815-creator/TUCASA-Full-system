import { useEffect, useState } from "react"
import { toast } from "sonner"
import { leadershipApi } from "@/api/endpoints/leadership"
import { AboutUsRequest } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Save } from "lucide-react"

export default function AboutUsManagement() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<AboutUsRequest>({
    title: "",
    description: "",
    mission: "",
    vision: "",
    contactInformation: "",
    organizationName: "",
    branchName: "",
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await leadershipApi.getAboutUs()
      setFormData({
        title: res.title || "",
        description: res.description || "",
        mission: res.mission || "",
        vision: res.vision || "",
        contactInformation: res.contactInformation || "",
        organizationName: res.organizationName || "",
        branchName: res.branchName || "",
      })
    } catch (err) {
      toast.error("Failed to load About Us content")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (key: keyof AboutUsRequest, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await leadershipApi.updateAboutUs(formData)
      toast.success("About Us updated successfully")
    } catch (err) {
      toast.error("Failed to update About Us")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>About Us Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>About Us Management</CardTitle>
            <CardDescription>Edit the content displayed on the public About Us page</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="About Us"
            />
          </div>

          <div>
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              value={formData.organizationName || ""}
              onChange={(e) => handleChange("organizationName", e.target.value)}
              placeholder="Tanzania Universities and Colleges Adventist Students Association"
            />
          </div>

          <div>
            <Label htmlFor="branchName">Branch Name</Label>
            <Input
              id="branchName"
              value={formData.branchName || ""}
              onChange={(e) => handleChange("branchName", e.target.value)}
              placeholder="TUCASA UDSM MABIBO HOSTEL"
            />
          </div>

          <Separator />

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of the organization..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="mission">Mission</Label>
            <Textarea
              id="mission"
              value={formData.mission || ""}
              onChange={(e) => handleChange("mission", e.target.value)}
              placeholder="Our mission statement..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="vision">Vision</Label>
            <Textarea
              id="vision"
              value={formData.vision || ""}
              onChange={(e) => handleChange("vision", e.target.value)}
              placeholder="Our vision statement..."
              rows={4}
            />
          </div>

          <Separator />

          <div>
            <Label htmlFor="contactInformation">Contact Information</Label>
            <Textarea
              id="contactInformation"
              value={formData.contactInformation || ""}
              onChange={(e) => handleChange("contactInformation", e.target.value)}
              placeholder="Location, phone, email, etc."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <>Save <Save size={16} className="ml-2" /></>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}