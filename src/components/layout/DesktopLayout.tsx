import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { GraduationCap, LogOut } from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface DesktopLayoutProps {
  children: React.ReactNode
  navigation: NavigationItem[]
  themeToggle: React.ReactNode
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  navigation,
  themeToggle,
}) => {
  const location = useLocation()

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar className="border-r border-border">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">TeacherHub</h1>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.href}
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.href && "bg-accent text-accent-foreground"
                  )}
                >
                  <Link to={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon">
              <LogOut className="h-4 w-4" />
            </Button>
            {themeToggle}
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset className="flex-1 w-full max-w-none">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 w-full">
            <SidebarTrigger />
            <div className="ml-auto flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Welcome back, Teacher!
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 w-full max-w-none">
          <div className="w-full max-w-none">
            {children}
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
