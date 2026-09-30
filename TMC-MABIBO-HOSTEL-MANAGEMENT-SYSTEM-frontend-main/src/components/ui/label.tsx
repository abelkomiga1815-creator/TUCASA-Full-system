import { LabelHTMLAttributes } from "react"
import { cn } from "@/utils/cn"

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium leading-none mb-1 block", className)}
      {...props}
    />
  )
}
