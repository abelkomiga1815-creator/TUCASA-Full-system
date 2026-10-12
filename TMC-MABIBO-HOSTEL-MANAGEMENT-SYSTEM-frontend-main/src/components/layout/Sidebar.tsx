import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Megaphone,
  MessageCircle,
  Users,
  ShieldCheck,
  Crown,
  GraduationCap,
  Building2,
  UserCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  Settings,
  CalendarClock,
  Wallet,
  Receipt,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { imageUrl } from "@/utils/imageUrl"
import { siteConfig } from "@/config/siteConfig"

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive"
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/materials", label: "Spiritual Materials", icon: BookOpen },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/about", label: "About Us", icon: Users },
  { to: "/fees", label: "My Fees", icon: Receipt },
  { to: "/leadership", label: "Leadership Structure", icon: Building2 },
]

const LEADER_NAV_ITEMS: NavItem[] = [
  { to: "/leader", label: "Leader Tools", icon: Crown },
  { to: "/leadership/past", label: "Past Leadership", icon: GraduationCap },
]

const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
  { to: "/admin/positions", label: "Positions", icon: Crown },
  { to: "/admin/regimes", label: "Regimes", icon: Calendar },
  { to: "/admin/assignments", label: "Assignments", icon: Users },
  { to: "/admin/fees", label: "Membership Fees", icon: Wallet },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { user, logout, semesterUpdated } = useAuth()
  const location = useLocation()
  const showSemesterAlert = !!user && user.status === "ACTIVE" && !semesterUpdated

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  // Close the account menu when navigating to another page
  useEffect(() => {
    setIsAccountMenuOpen(false)
  }, [location.pathname])

  // Close the account menu on outside click or Escape
  useEffect(() => {
    if (!isAccountMenuOpen) return
    const handlePointerDown = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAccountMenuOpen(false)
    }
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isAccountMenuOpen])

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + "/")

  const getNavItems = () => {
    const items = [...NAV_ITEMS]
    if (user?.role === "LEADER" || user?.role === "ADMIN") items.push(...LEADER_NAV_ITEMS)
    if (user?.role === "ADMIN") items.push(...ADMIN_NAV_ITEMS)
    return items
  }

  const navItems = getNavItems()

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden animate-fade-in"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          // Base
          "z-50 flex h-screen flex-col bg-card border-r transition-all duration-300 ease-smooth",
          // Width - always full width when rendered
          "w-64",
          // Mobile: fixed drawer that slides in/out
          "fixed left-0 top-0 sm:relative sm:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0",
          // Shadow
          "shadow-large"
        )}
        aria-label="Sidebar navigation"
      >
        {/* Brand header */}
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card p-1">
              <img
                src={siteConfig.logo}
                alt="PCM Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="hidden">
                <svg className="h-5 w-5 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2L4 26h24L16 2z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M16 22V10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10 16h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <span className="flex-col font-bold text-primary tracking-tight flex">
              <span className="truncate text-sm leading-tight">{siteConfig.branchName}</span>
              <span className="truncate text-[10px] font-normal leading-tight text-muted-foreground">
                UDSM Mabibo Hostel
              </span>
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1" role="list">
            {navItems.map(({ to, label, icon: Icon, badge, badgeVariant }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive: routeActive }) =>
                    cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      routeActive
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-soft"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      "before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity",
                      "hover:before:opacity-100 before:bg-primary/5"
                    )
                  }
                  onClick={onMobileClose}
                >
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/10">
                    <Icon size={20} className={cn(
                      "transition-colors",
                      "text-muted-foreground",
                      "group-hover:text-primary"
                    )} aria-hidden="true" />
                  </span>
                  <span className="truncate font-medium">{label}</span>
                  {badge && (
                    <span className={cn(
                      "absolute right-3 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                      badgeVariant === "destructive" ? "bg-destructive text-destructive-foreground" :
                      badgeVariant === "secondary" ? "bg-secondary text-secondary-foreground" :
                      "bg-primary text-primary-foreground"
                    )}>
                      {badge}
                    </span>
                  )}
                  {isActive(to) && (
                    <span
                      className="absolute right-3 h-6 w-0.5 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Compact semester-update indicator */}
        {showSemesterAlert && (
          <div className="px-3 pb-2">
            <NavLink
              to="/update-semester"
              onClick={onMobileClose}
              className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-amber-800 dark:bg-amber-900/30 dark:hover:bg-amber-900/50"
            >
              <CalendarClock size={18} className="shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span className="flex-1 truncate font-medium text-amber-800 dark:text-amber-200">Semester Update</span>
              <Badge variant="warning" size="sm">Required</Badge>
            </NavLink>
          </div>
        )}

        {/* User area */}
        <div className="border-t p-3">
          <div ref={accountMenuRef} className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsAccountMenuOpen((open) => !open)}
              aria-expanded={isAccountMenuOpen}
              aria-haspopup="menu"
              className="w-full justify-start gap-3 px-3 py-2.5 text-sm rounded-xl"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={imageUrl(user?.profilePicUrl)} alt={user?.firstName} />
                <AvatarFallback className="text-xs font-medium">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="truncate font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs capitalize text-muted-foreground">{user?.role?.toLowerCase()}</p>
              </div>
              {isAccountMenuOpen
                ? <ChevronUp size={14} aria-hidden="true" />
                : <ChevronDown size={14} aria-hidden="true" />}
            </Button>

            {isAccountMenuOpen && (
              <div
                role="menu"
                aria-label="Account menu"
                className={cn(
                  "absolute bottom-full z-50 mb-2 w-52 animate-scale-in overflow-hidden rounded-xl border bg-popover py-1.5 text-sm shadow-large",
                  "left-0 right-0"
                )}
              >
                <NavLink
                  to="/profile"
                  role="menuitem"
                  onClick={() => { setIsAccountMenuOpen(false); onMobileClose(); }}
                  className="mx-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <UserCircle size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>Profile</span>
                </NavLink>
                <NavLink
                  to="/settings"
                  role="menuitem"
                  onClick={() => { setIsAccountMenuOpen(false); onMobileClose(); }}
                  className="mx-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Settings size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>Settings</span>
                </NavLink>
                <div className="mx-3 my-1.5 h-px bg-muted" role="separator" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setIsAccountMenuOpen(false); logout(); onMobileClose(); }}
                  className="mx-1 flex w-[calc(100%-0.5rem)] items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LogOut size={16} className="shrink-0" aria-hidden="true" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}