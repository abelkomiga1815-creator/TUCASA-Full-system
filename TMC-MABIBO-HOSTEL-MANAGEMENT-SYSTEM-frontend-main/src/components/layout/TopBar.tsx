import { Link } from "react-router-dom"
import { Menu, Bell, Sun, Moon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/siteConfig"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme()
  const darkMode = theme === "dark"
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-xl px-4 shadow-soft sm:px-6 transition-shadow duration-200 hover:shadow-medium">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          <Menu size={24} />
        </Button>

        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img
            src={siteConfig.logo}
            alt="PCM Logo"
            className="h-9 w-9 shrink-0 rounded-lg bg-card object-contain p-0.5 shadow-soft"
          />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-bold tracking-tight text-primary">
              {siteConfig.branchName}
            </span>
            <span className="max-w-[320px] truncate text-[11px] font-normal text-muted-foreground">
              {siteConfig.organizationName}
            </span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell size={20} />
        </Button>

        {user && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            onClick={logout}
          >
            <LogOut size={20} />
          </Button>
        )}
      </div>
    </header>
  )
}
