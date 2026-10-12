import { forwardRef, type HTMLAttributes, type SelectHTMLAttributes } from "react"
import { cn } from "@/utils/cn"

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-white px-4 py-2.5 text-sm placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        "transition-all duration-200",
        "hover:border-primary/50",
        "dark:bg-slate-800 dark:border-slate-600 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = "Select"

interface SelectTriggerProps extends HTMLAttributes<HTMLDivElement> {}

export const SelectTrigger = forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-xl border border-input bg-white px-4 py-2.5 text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        "transition-all duration-200",
        "hover:border-primary/50",
        "dark:bg-slate-800 dark:border-slate-600 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {}

export const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={cn("text-sm font-medium", className)} {...props}>
      {children}
    </span>
  )
)
SelectValue.displayName = "SelectValue"

interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  position?: "popper" | "inline"
}

export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, position = "popper", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[12rem] overflow-hidden rounded-xl border bg-popover py-2 text-sm shadow-large",
        "animate-scale-in",
        position === "popper" && "absolute",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
SelectContent.displayName = "SelectContent"

interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      data-value={value}
      data-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  )
)
SelectItem.displayName = "SelectItem"