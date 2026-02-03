import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Teacher {
  teacherID: string
  firstName: string
  lastName?: string
  email: string
}

interface AuthContextType {
  teacher: Teacher | null
  isAuthenticated: boolean
  login: (teacherID: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('teacherToken')
      if (!token) {
        setLoading(false)
        return
      }

      // Try to get teacher profile to verify auth
      const response = await fetch('/api/teachers/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.teacher) {
          setTeacher({
            teacherID: data.teacher.teacherID || data.teacherId,
            firstName: data.teacher.firstName,
            lastName: data.teacher.lastName,
            email: data.teacher.email
          })
        }
      } else {
        // Token invalid, clear it
        localStorage.removeItem('teacherToken')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('teacherToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (teacherID: string, password: string) => {
    try {
      const response = await fetch('/api/teachers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherID, password })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }))
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      
      // Store JWT token from response
      if (data.token) {
        localStorage.setItem('teacherToken', data.token)
      } else {
        throw new Error('No token received from server')
      }
      
      // Set teacher info from response (backend returns 'user' not 'teacher')
      if (data.user) {
        setTeacher({
          teacherID: data.user.teacherID || teacherID,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email
        })
        // Force immediate state update to ensure auth state propagates
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('teacherToken')
      if (token) {
        await fetch('/api/teachers/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('teacherToken')
      setTeacher(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        teacher,
        isAuthenticated: !!teacher,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

