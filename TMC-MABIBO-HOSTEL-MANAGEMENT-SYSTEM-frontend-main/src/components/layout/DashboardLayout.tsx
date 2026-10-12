import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { Footer } from "./Footer"
import { WhatsAppButton } from "./WhatsAppButton"

export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Persist collapse state across reloads
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed")
    if (saved !== null) setCollapsed(saved === "true")
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", collapsed.toString())
  }, [collapsed])

  const handleSidebarToggle = () => {
    if (window.innerWidth < 640) {
      setMobileOpen(!mobileOpen)
    } else {
      setCollapsed(!collapsed)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      {!collapsed && (
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
      )}

      {/* Right column: TopBar + scrollable main + Footer */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={handleSidebarToggle} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children ?? <Outlet />}
          </div>
          <Footer />
        </main>
      </div>

      <WhatsAppButton />
    </div>
  )
}