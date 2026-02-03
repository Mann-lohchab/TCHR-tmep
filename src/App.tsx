

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DesktopLayout } from '@/components/layout/DesktopLayout'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Dashboard } from '@/pages/Dashboard'
import { Assignments } from '@/pages/Assignments'
import { Marks } from '@/pages/Marks'
import { Notifications } from '@/pages/Notifications'
import { Attendance } from '@/pages/Attendance'
import { Students } from '@/pages/Students'
import { Login } from '@/pages/Login'
import { Agent } from '@/pages/Agent'
import Profile from '@/pages/Profile'
import { Home, BookOpen, Users, Bell, BarChart3, UserCheck, Bot, User } from 'lucide-react'

// Navigation items for the sidebar
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Assignments', href: '/assignments', icon: BookOpen },
  { name: 'Attendance', href: '/attendance', icon: UserCheck },
  { name: 'Marks', href: '/marks', icon: BarChart3 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'AI Agent', href: '/agent', icon: Bot },
  { name: 'Profile', href: '/profile', icon: User },
]

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <SidebarProvider>
              <div className="min-h-screen w-full bg-background font-sans antialiased">
                <DesktopLayout 
                  navigation={navigationItems}
                  themeToggle={<ThemeToggle />}
                >
                
                  <Routes>
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
                    <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                    <Route path="/marks" element={<ProtectedRoute><Marks /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/agent" element={<ProtectedRoute><Agent /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </DesktopLayout>
              </div>
            </SidebarProvider>
          }
        />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

// 404 Not Found component
const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
        <p className="text-muted-foreground mb-4">Page not found</p>
        <a 
          href="/" 
          className="text-primary hover:text-primary/80 underline"
        >
          Go back to Dashboard
        </a>
      </div>
    </div>
  )
}

export default App