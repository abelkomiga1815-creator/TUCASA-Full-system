import { type HTMLAttributes } from "react"
import { cn } from "@/utils/cn"
import { Button } from "./button"

interface AlertDialogProps extends HTMLAttributes<HTMLDivElement> {}

export const AlertDialog = ({ children, ...props }: AlertDialogProps) => (
  <div {...props}>{children}</div>
)

interface AlertDialogTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const AlertDialogTrigger = ({ asChild, children, ...props }: AlertDialogTriggerProps) => {
  if (asChild && typeof children === "object" && children !== null && "type" in children) {
    return children
  }
  return <button {...props}>{children}</button>
}

interface AlertDialogContentProps extends HTMLAttributes<HTMLDivElement> {}

export const AlertDialogContent = ({ className, children, ...props }: AlertDialogContentProps) => (
  <div
    className={cn(
      "relative z-50 w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl animate-scale-in",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

interface AlertDialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const AlertDialogHeader = ({ className, children, ...props }: AlertDialogHeaderProps) => (
  <div className={cn("flex flex-col gap-2 text-center", className)} {...props}>
    {children}
  </div>
)

interface AlertDialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const AlertDialogTitle = ({ className, children, ...props }: AlertDialogTitleProps) => (
  <h2 className={cn("text-xl font-semibold tracking-tight", className)} {...props}>
    {children}
  </h2>
)

interface AlertDialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const AlertDialogDescription = ({ className, children, ...props }: AlertDialogDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
)

interface AlertDialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const AlertDialogFooter = ({ className, children, ...props }: AlertDialogFooterProps) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4", className)} {...props}>
    {children}
  </div>
)

interface AlertDialogActionProps extends HTMLAttributes<HTMLButtonElement> {}

export const AlertDialogAction = ({ className, children, ...props }: AlertDialogActionProps) => (
  <Button className="w-full sm:w-auto" {...props}>
    {children}
  </Button>
)

interface AlertDialogCancelProps extends HTMLAttributes<HTMLButtonElement> {}

export const AlertDialogCancel = ({ className, children, ...props }: AlertDialogCancelProps) => (
  <Button variant="outline" {...props}>
    {children}
  </Button>
)