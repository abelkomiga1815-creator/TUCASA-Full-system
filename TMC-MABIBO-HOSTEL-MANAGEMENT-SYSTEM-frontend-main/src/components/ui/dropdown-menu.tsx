import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/utils/cn"

interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {}

export const DropdownMenu = ({ children, ...props }: DropdownMenuProps) => (
  <div {...props}>{children}</div>
)

interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

export const DropdownMenuTrigger = forwardRef<HTMLDivElement, DropdownMenuTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild && typeof children === "object" && children !== null && "type" in children) {
      return children
    }
    return <div ref={ref} {...props}>{children}</div>
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end"
  className?: string
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "start", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-50 min-w-[12rem] overflow-hidden rounded-xl border bg-popover py-1.5 text-sm shadow-large",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "animate-scale-in",
        align === "end" && "right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownMenuContent.displayName = "DropdownMenuContent"

interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
  inset?: boolean
}

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ asChild, className, children, inset, ...props }, ref) => {
    if (asChild && typeof children === "object" && children !== null && "type" in children) {
      return children
    }
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200",
          "focus:bg-accent focus:text-accent-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          inset && "pl-8",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

interface DropdownMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1.5 h-px bg-muted", className)}
      {...props}
    />
  )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

interface DropdownMenuLabelProps extends HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider", className)}
      {...props}
    />
  )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

interface DropdownMenuShortcutProps extends HTMLAttributes<HTMLSpanElement> {}

export const DropdownMenuShortcut = forwardRef<HTMLSpanElement, DropdownMenuShortcutProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"