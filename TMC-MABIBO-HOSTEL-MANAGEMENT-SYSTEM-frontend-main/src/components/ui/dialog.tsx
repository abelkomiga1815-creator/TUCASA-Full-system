import { ReactNode, forwardRef } from "react"
import { cn } from "@/utils/cn"
import { X } from "lucide-react"
import { Button } from "./button"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  size?: "sm" | "default" | "lg" | "xl" | "full"
}

const sizeClasses: Record<string, string> = {
  sm: "max-w-sm",
  default: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
}

export function Dialog({ open, onOpenChange, children, size = "default" }: DialogProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn(
          "w-full rounded-2xl bg-card shadow-2xl animate-scale-in",
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2 p-6 pb-0 sm:p-6", className)} {...props} />
  )
)
DialogHeader.displayName = "DialogHeader"

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-xl font-semibold tracking-tight", className)} {...props} />
  )
)
DialogTitle.displayName = "DialogTitle"

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
DialogDescription.displayName = "DialogDescription"

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pb-0 sm:p-6", className)} {...props} />
  )
)
DialogContent.displayName = "DialogContent"

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-6 pt-0", className)} {...props} />
  )
)
DialogFooter.displayName = "DialogFooter"

interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ className, children, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("absolute right-4 top-4 rounded-lg hover:bg-muted/50", className)}
      {...props}
    >
      {children ?? <X size={18} />}
    </Button>
  )
)
DialogClose.displayName = "DialogClose"