import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import { useAuth } from "@/hooks/useAuth"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

import Login from "@/pages/Login"
import Register from "@/pages/Register"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"
import Dashboard from "@/pages/Dashboard"
import UpdateSemester from "@/pages/UpdateSemester"
import Chat from "@/pages/Chat"
import Materials from "@/pages/Materials"
import Profile from "@/pages/Profile"
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

function ProtectedRoute({
  children,
  adminOnly = false,
  leaderOnly = false
}: {
  children: React.ReactNode
  adminOnly?: boolean
  leaderOnly?: boolean
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>
  }
  if (!user) return <Navigate to="/login" replace />
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
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/update-semester" element={<UpdateSemester />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/events" element={<Events />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
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
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </Router>
  )
}