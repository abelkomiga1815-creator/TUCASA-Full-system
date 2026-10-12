import { InputHTMLAttributes, forwardRef, useState } from "react"
import { cn } from "@/utils/cn"
import { Eye, EyeOff } from "lucide-react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  showPasswordToggle?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showPasswordToggle = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPasswordType = type === "password"

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={isPasswordType && showPasswordToggle ? (showPassword ? "text" : "password") : type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-input bg-white px-4 py-2.5 text-sm placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
            "transition-all duration-200",
            "hover:border-primary/50",
            "placeholder:text-muted-foreground/70",
            "dark:bg-slate-800 dark:border-slate-600 dark:text-white",
            isPasswordType && showPasswordToggle && "pr-12",
            className
          )}
          {...props}
        />
        {isPasswordType && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"