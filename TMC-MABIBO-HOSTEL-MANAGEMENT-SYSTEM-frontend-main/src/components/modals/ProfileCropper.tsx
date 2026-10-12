import { useCallback, useEffect, useRef, useState } from "react"
import { X, ZoomIn, ZoomOut, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ProfileCropperProps {
  open: boolean
  onClose: () => void
  onSave: (croppedFile: File) => void | Promise<void>
  /** MIME types offered in the file picker. */
  accept?: string
  maxSizeMB?: number
}

/** Formats the cropper can decode. JPEG only as per requirements.
 *  The browser's canvas decoder handles JPEG; the crop is re-encoded to JPEG on export.
 *  The backend also validates the actual image content is JPEG. */
const SUPPORTED_TYPES = ["image/jpeg", "image/jpg"]

/** Side of the square image that is written to the canvas. */
const OUTPUT_SIZE = 512

/** Upper zoom bound, expressed as a multiple of the minimum cover scale. */
const MAX_ZOOM_FACTOR = 4

interface Geometry {
  /** Side of the square crop frame in CSS pixels. */
  frame: number
  /** Displayed size of the image inside the frame. */
  dispW: number
  disph: number
  /** Top-left of the image inside the frame. */
  left: number
  top: number
}

export function ProfileCropper({ open, onClose, onSave, accept = "image/jpeg,image/jpg", maxSizeMB = 2 }: ProfileCropperProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(null)

  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [croppedFile, setCroppedFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [frameSize, setFrameSize] = useState(288)

  const frameRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragState = useRef<{ id: number; startX: number; startY: number; startOffset: { x: number; y: number } } | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null)

  // Reset everything whenever the modal is opened so each session starts fresh.
  useEffect(() => {
    if (!open) {
      setObjectUrl(null)
      setSourceFile(null)
      setImageSize(null)
      setPreviewUrl(null)
      setCroppedFile(null)
      setShowPreview(false)
      setLoading(false)
      setScale(1)
      setOffset({ x: 0, y: 0 })
    }
  }, [open])

  // Track the frame's real pixel size so the crop maths matches what is drawn.
  useEffect(() => {
    if (!open) return
    const el = frameRef.current
    if (!el) return
    const measure = () => setFrameSize(el.clientWidth || 288)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [open])

  const minScale = imageSize ? Math.max(1, imageSize.w / imageSize.h) : 1
  const maxScale = minScale * MAX_ZOOM_FACTOR

  /** Single source of truth for where the image sits, used by BOTH the
   *  on-screen preview and the canvas export so they can never drift apart. */
  const geometry = useCallback((): Geometry | null => {
    if (!imageSize || !frameSize) return null
    const dispW = frameSize * scale
    const dispH = frameSize * scale * (imageSize.h / imageSize.w)
    return {
      frame: frameSize,
      dispW,
      disph: dispH,
      left: (frameSize - dispW) / 2 + offset.x,
      top: (frameSize - dispH) / 2 + offset.y,
    }
  }, [imageSize, frameSize, scale, offset])

  /** Keeps the image covering the whole square frame (never any empty gap). */
  const clampOffset = useCallback(
    (next: { x: number; y: number }, nextScale: number) => {
      if (!imageSize || !frameSize) return next
      const dispW = frameSize * nextScale
      const dispH = frameSize * nextScale * (imageSize.h / imageSize.w)
      const slackX = Math.max(0, (dispW - frameSize) / 2)
      const slackY = Math.max(0, (dispH - frameSize) / 2)
      return {
        x: Math.min(slackX, Math.max(-slackX, next.x)),
        y: Math.min(slackY, Math.max(-slackY, next.y)),
      }
    },
    [imageSize, frameSize]
  )

  const resetView = useCallback(() => {
    setScale(minScale)
    setOffset({ x: 0, y: 0 })
  }, [minScale])

  // ------------------------------------------------------------------ file in

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    // Allow re-selecting the same file later.
    e.target.value = ""
    if (!selected) return

    const isSupported = SUPPORTED_TYPES.includes(selected.type.toLowerCase())
    if (!isSupported) {
      toast.error("Unsupported file type. Please choose a JPEG (.jpg or .jpeg) image.")
      return
    }

    if (selected.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image is too large. Please choose a file smaller than ${maxSizeMB}MB.`)
      return
    }

    const url = URL.createObjectURL(selected)
    const probe = new Image()
    probe.onload = () => {
      // Revoke the previous object URL only after the replacement is ready.
      setObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
      setSourceFile(selected)
      setImageSize({ w: probe.naturalWidth, h: probe.naturalHeight })
      setScale(Math.max(1, probe.naturalWidth / probe.naturalHeight))
      setOffset({ x: 0, y: 0 })
      setPreviewUrl(null)
      setCroppedFile(null)
      setShowPreview(false)
    }
    probe.onerror = () => {
      URL.revokeObjectURL(url)
      toast.error("That image could not be read. Please try a different file.")
    }
    probe.src = url
  }

  // ------------------------------------------------------------------ gestures

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!imageSize) return
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinchStart.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale }
      dragState.current = null
      return
    }
    dragState.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, startOffset: { ...offset } }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!imageSize) return
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    }

    if (pinchStart.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      if (distance > 0) {
        const next = Math.min(maxScale, Math.max(minScale, pinchStart.current.scale * (distance / pinchStart.current.distance)))
        setScale(next)
        setOffset((prev) => clampOffset(prev, next))
      }
      return
    }

    const drag = dragState.current
    if (!drag || drag.id !== e.pointerId) return
    setOffset(clampOffset({ x: drag.startOffset.x + (e.clientX - drag.startX), y: drag.startOffset.y + (e.clientY - drag.startY) }, scale))
  }

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchStart.current = null
    if (dragState.current?.id === e.pointerId) dragState.current = null
  }

  /** Wheel zoom anchored on the cursor so the point under the mouse stays put. */
  const handleWheel = (e: React.WheelEvent) => {
    if (!imageSize) return
    e.preventDefault()
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return

    const next = Math.min(maxScale, Math.max(minScale, scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12)))
    if (next === scale) return

    const px = e.clientX - rect.left
    const py = e.clientY - rect.top

    // Image coordinate currently under the cursor.
    const g = geometry()
    if (!g) return
    const imgX = px - g.left
    const imgY = py - g.top

    const dispW = frameSize * next
    const dispH = frameSize * next * (imageSize.h / imageSize.w)
    const rawOffset = { x: px - imgX * next - (frameSize - dispW) / 2, y: py - imgY * next - (frameSize - dispH) / 2 }
    setScale(next)
    setOffset(clampOffset(rawOffset, next))
  }

  const zoomBy = (factor: number) => {
    const next = Math.min(maxScale, Math.max(minScale, scale * factor))
    setScale(next)
    setOffset((prev) => clampOffset(prev, next))
  }

  // ------------------------------------------------------------------- export

  const buildCrop = useCallback(async (): Promise<{ file: File; dataUrl: string } | null> => {
    const img = imgRef.current
    const g = geometry()
    if (!img || !g || !sourceFile || !imageSize) return null

    // Scale factor from displayed pixels back to the image's natural pixels.
    const k = imageSize.w / g.dispW
    const side = g.frame * k

    // Clamp into the image so rounding can never sample outside it.
    const sx = Math.min(Math.max(0, g.left * k), imageSize.w - side)
    const sy = Math.min(Math.max(0, g.top * k), imageSize.h - side)

    const canvas = document.createElement("canvas")
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92))
    if (!blob) return null

    const file = new File([blob], "profile.jpg", { type: "image/jpeg" })
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92)
    return { file, dataUrl }
  }, [geometry, sourceFile, imageSize])

  const handleCrop = async () => {
    setLoading(true)
    try {
      const result = await buildCrop()
      if (!result) {
        toast.error("Could not prepare the cropped image. Please try again.")
        return
      }
      setCroppedFile(result.file)
      setPreviewUrl(result.dataUrl)
      setShowPreview(true)
    } catch {
      toast.error("Could not crop the image. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!croppedFile) return
    setLoading(true)
    try {
      // Only report success / close once the backend has confirmed.
      await onSave(croppedFile)
      toast.success("Profile photo updated")
      onClose()
    } catch {
      // The previous photo is untouched by the backend on failure, so the user
      // keeps their existing avatar and can simply retry.
      toast.error("Could not save your photo. Your previous photo is unchanged.")
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------------- render

  if (!open) return null

  const g = geometry()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          data-testid="passport-file-input"
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{showPreview ? "Preview" : "Position your photo"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </Button>
        </div>

        {!showPreview && (
          <>
            {sourceFile ? (
              <>
                {/* Square crop frame: the image is dragged and zoomed underneath it */}
                <div className="p-6 flex flex-col items-center">
                  <div
                    ref={frameRef}
                    className="relative w-[min(78vw,288px)] h-[min(78vw,288px)] rounded-2xl overflow-hidden bg-muted touch-none cursor-grab active:cursor-grabbing select-none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endPointer}
                    onPointerCancel={endPointer}
                    onWheel={handleWheel}
                  >
                    {objectUrl && g && (
                      <img
                        ref={imgRef}
                        src={objectUrl}
                        alt="Crop preview"
                        draggable={false}
                        className="pointer-events-none absolute max-w-none will-change-transform"
                        style={{
                          width: g.dispW,
                          height: g.disph,
                          left: g.left,
                          top: g.top,
                          WebkitUserDrag: "none",
                        } as React.CSSProperties}
                      />
                    )}

                    {/* Circular guide, matching how avatars are rendered app-wide */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/70" />
                    <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/70" />

                    {/* Loading hint while the source image decodes */}
                    {!imageSize && (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                        Loading image...
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-center text-xs text-muted-foreground max-w-xs">
                    Drag the photo to position it, then use the slider or scroll to zoom. The photo always fills the square frame.
                  </p>
                </div>

                {/* Controls */}
                <div className="px-6 pb-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out" disabled={!imageSize}>
                      <ZoomOut size={16} />
                    </Button>
                    <input
                      type="range"
                      min={minScale}
                      max={maxScale}
                      step={minScale / 100}
                      value={scale}
                      onChange={(e) => {
                        const next = Number(e.target.value)
                        setScale(next)
                        setOffset((prev) => clampOffset(prev, next))
                      }}
                      className="flex-1 accent-primary"
                      aria-label="Zoom"
                      disabled={!imageSize}
                    />
                    <Button variant="outline" size="icon" onClick={() => zoomBy(1.2)} aria-label="Zoom in" disabled={!imageSize}>
                      <ZoomIn size={16} />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <RefreshCw size={16} className="mr-1" />
                      Choose another
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={resetView} disabled={!imageSize}>
                        Reset
                      </Button>
                      <Button size="sm" onClick={handleCrop} disabled={loading || !imageSize}>
                        {loading ? "Working..." : "Crop & preview"}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-12">
                <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()} className="gap-2">
                  Select a photo
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground max-w-xs">
                  Choose a JPEG (.jpg or .jpeg) image (max {maxSizeMB}MB). You can drag and zoom it to fit next.
                </p>
              </div>
            )}
          </>
        )}

        {showPreview && previewUrl && (
          <div className="flex flex-col items-center p-6">
            <div className="w-[min(70vw,240px)] h-[min(70vw,240px)] rounded-full overflow-hidden border-4 border-primary/20 shadow-large bg-muted">
              <img src={previewUrl} alt="Cropped preview" className="w-full h-full object-cover" />
            </div>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              This is exactly how your profile photo will look.
            </p>
            <div className="mt-6 flex gap-3 w-full max-w-xs">
              <Button variant="outline" className="flex-1" onClick={() => setShowPreview(false)} disabled={loading}>
                Re-crop
              </Button>
              <Button className="flex-1" onClick={handleConfirm} disabled={loading}>
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Check size={16} className="mr-1" />
                    Save photo
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
