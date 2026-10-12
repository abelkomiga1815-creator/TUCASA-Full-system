import { FormEvent, useState } from "react"
import { toast } from "sonner"
import { leaderApi } from "@/api/endpoints/admin"
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function CreateEventModal({
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
  const [date, setDate] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await leaderApi.createEvent({ title, description, startsAt: date, location })
      toast.success("Event created")
      setTitle("")
      setDescription("")
      setDate("")
      setLocation("")
      onSuccess?.()
      onClose()
    } catch {
      toast.error("Could not create event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogHeader>
        <DialogTitle>Create event</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="ev-title">Title</Label>
          <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="ev-desc">Description</Label>
          <Input id="ev-desc" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="ev-date">Date</Label>
          <Input id="ev-date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="ev-location">Location</Label>
          <Input id="ev-location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
