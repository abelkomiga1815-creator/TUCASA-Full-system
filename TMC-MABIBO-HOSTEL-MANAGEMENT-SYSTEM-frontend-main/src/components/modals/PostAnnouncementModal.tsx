import { FormEvent, useState } from "react"
import { toast } from "sonner"
import { leaderApi } from "@/api/endpoints/admin"
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function PostAnnouncementModal({
  open,
  onClose,
  onSuccess
}: {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await leaderApi.postAnnouncement({ title, content })
      toast.success("Announcement posted")
      setTitle("")
      setContent("")
      onSuccess?.()
      onClose()
    } catch {
      toast.error("Could not post announcement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogHeader>
        <DialogTitle>Post announcement</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="ann-title">Title</Label>
          <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="ann-content">Content</Label>
          <Input id="ann-content" value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
