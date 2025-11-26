import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DesktopLayout } from '@/components/layout/DesktopLayout'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Dashboard } from '@/pages/Dashboard'
import { Assignments } from '@/pages/Assignments'
import { Marks } from '@/pages/Marks'
import { Notifications } from '@/pages/Notifications'
import { Attendance } from '@/pages/Attendance'
import { Students } from '@/pages/Students'
import { Home, BookOpen, Users, Bell, BarChart3, UserCheck } from 'lucide-react'

// Navigation items for the sidebar
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Assignments', href: '/assignments', icon: BookOpen },
  { name: 'Attendance', href: '/attendance', icon: UserCheck },
  { name: 'Marks', href: '/marks', icon: BarChart3 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
]

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Router>
        <SidebarProvider>
          <div className="min-h-screen w-full bg-background font-sans antialiased">
            <DesktopLayout 
              navigation={navigationItems}
              themeToggle={<ThemeToggle />}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/marks" element={<Marks />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DesktopLayout>
          </div>
        </SidebarProvider>
      </Router>
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
