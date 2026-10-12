import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

import Login from "@/pages/Login"
import Register from "@/pages/Register"
import ForgotPassword from "@/pages/ForgotPassword"
import ForcePasswordChange from "@/pages/ForcePasswordChange"
import Dashboard from "@/pages/Dashboard"
import UpdateSemester from "@/pages/UpdateSemester"
import Chat from "@/pages/Chat"
import Materials from "@/pages/Materials"
import Profile from "@/pages/Profile"
import Settings from "@/pages/Settings"
import Events from "@/pages/Events"
import Announcements from "@/pages/Announcements"
import About from "@/pages/About"
import Leadership from "@/pages/Leadership"
import PastLeadership from "@/pages/PastLeadership"
import Leader from "@/pages/Leader"
import Fees from "@/pages/Fees"
import AdminPanel from "@/pages/admin/AdminPanel"
import AdminPositions from "@/pages/admin/Positions"
import AdminRegimes from "@/pages/admin/Regimes"
import AdminAssignments from "@/pages/admin/Assignments"
import AdminFees from "@/pages/admin/Fees"
import AdminAboutUsManagement from "@/pages/admin/AboutUsManagement"

function ProtectedRoute({
  children,
  adminOnly = false,
  leaderOnly = false,
  allowPasswordChange = false
}: {
  children: React.ReactNode
  adminOnly?: boolean
  leaderOnly?: boolean
  allowPasswordChange?: boolean
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>
  }
  if (!user) return <Navigate to="/login" replace />
  if (!allowPasswordChange && user.mustChangePassword) return <Navigate to="/force-password-change" replace />
  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/dashboard" replace />
  if (leaderOnly && user.role !== "LEADER" && user.role !== "ADMIN") return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  )
}

function ForcePasswordChangeLayout() {
  return (
    <ProtectedRoute allowPasswordChange>
      <ForcePasswordChange />
    </ProtectedRoute>
  )
}

function AdminLayout() {
  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout />
    </ProtectedRoute>
  )
}

function LeaderLayout() {
  return (
    <ProtectedRoute leaderOnly>
      <DashboardLayout />
    </ProtectedRoute>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/force-password-change" element={<ForcePasswordChangeLayout />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/update-semester" element={<UpdateSemester />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/events" element={<Events />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/leadership" element={<Leadership />} />
        <Route path="/leadership/past" element={<PastLeadership />} />
        <Route path="/fees" element={<Fees />} />
      </Route>
      <Route element={<LeaderLayout />}>
        <Route path="/leader" element={<Leader />} />
      </Route>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/positions" element={<AdminPositions />} />
        <Route path="/admin/regimes" element={<AdminRegimes />} />
        <Route path="/admin/assignments" element={<AdminAssignments />} />
        <Route path="/admin/fees" element={<AdminFees />} />
        <Route path="/admin/about-us" element={<AdminAboutUsManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  // Toast notifications ship their own palette; bind them to the active theme.
  const { theme } = useTheme()

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors theme={theme} />
      </AuthProvider>
    </Router>
  )
}