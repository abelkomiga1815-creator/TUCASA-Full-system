import { FormEvent, useState } from "react"
import { toast } from "sonner"
import { leaderApi } from "@/api/endpoints/admin"
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"

export function UploadMaterialModal({
  open,
  onClose,
  onSuccess
}: {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("DOCUMENT")
  const [fileUrl, setFileUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setTitle("")
    setDescription("")
    setType("DOCUMENT")
    setFileUrl("")
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await leaderApi.uploadMaterial({ title, description, type, fileUrl })
      toast.success("Material uploaded")
      reset()
      onSuccess?.()
      onClose()
    } catch {
      toast.error("Could not upload material")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogHeader>
        <DialogTitle>Upload material</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="mat-title">Title</Label>
          <Input id="mat-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="mat-desc">Description</Label>
          <Input id="mat-desc" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="mat-type">Type</Label>
          <Select id="mat-type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="SERMON">Sermon</option>
            <option value="BIBLE_STUDY">Bible study</option>
            <option value="SONG">Song</option>
            <option value="DOCUMENT">Document</option>
            <option value="VIDEO">Video</option>
            <option value="AUDIO">Audio</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="mat-url">File URL</Label>
          <Input id="mat-url" type="url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} required />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
