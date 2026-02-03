// API base URL - reads from .env file, defaults to port 3001
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'

// Import Teacher type for type safety
interface Teacher {
  _id: string
  teacherID: string
  firstName: string
  lastName?: string
  Address: string
  email: string
  sessionExpiry?: Date | null
  lastLoginAt?: Date
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  
  // Check if response is JSON
  if (!contentType || !contentType.includes('application/json')) {
    console.error('Server returned non-JSON response. Backend might be down.')
    throw new Error('Backend server not available or returned invalid response.')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`
    }))
    throw new Error(error.message || 'An error occurred')
  }

  return response.json()
}

// Get auth token from localStorage or context
const getAuthToken = (): string | null => {
  // Try to get from localStorage (if stored there)
  return localStorage.getItem('teacherToken')
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    
    // Get auth token if available
    const token = getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    }
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      // Clear any stored token
      localStorage.removeItem('teacherToken')
      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      throw new Error('Unauthorized - Please login')
    }

    return handleResponse<T>(response)
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API Error (${endpoint}):`, error.message)
      
      // Provide helpful error messages
      if (error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Check if backend is running on port 3001.`)
      }
      throw error
    }
    throw new Error('An unknown error occurred')
  }
}

// API methods - matching your Dashboard.tsx exactly
export const api = {
  // Teacher auth endpoints
  login: (teacherID: string, password: string) =>
    apiRequest<{ teacher?: any; message?: string }>('/api/teachers/login', {
      method: 'POST',
      body: JSON.stringify({ teacherID, password })
    }),
  
  logout: () =>
    apiRequest('/api/teachers/logout', {
      method: 'POST'
    }),
  
  // Teacher endpoints
  getTeacherProfile: () =>
    apiRequest<{ teacher: Teacher }>('/api/teachers/profile'),
  
  // Student endpoints
  getStudents: () => 
    apiRequest('/api/teachers/students'),
  
  // Homework/Assignment endpoints
  getHomework: () => 
    apiRequest('/api/teachers/Homework'),
  
  // Marks endpoints
  getAllMarks: () => 
    apiRequest('/api/teachers/Marks'),
  
  getMarks: () => 
    apiRequest('/api/teachers/Marks'),
  
  // Attendance endpoints
  getAttendance: () => 
    apiRequest('/api/teachers/Attendance'),
  
  // Notice endpoints
  getNotices: () => 
    apiRequest('/api/teachers/Notice'),
  
  // Calendar endpoints
  getCalendarEvents: () => 
    apiRequest('/api/teachers/Calendar'),

  // AI agent endpoints
  AIAgent: (message: string) =>
    apiRequest('/api/teachers/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
}

// Export default for easy import
export default api