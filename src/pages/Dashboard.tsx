// 




















import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, BookOpen, BarChart3, Bell, UserCheck, Calendar, TrendingUp, AlertCircle, Clock, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { api } from '@/serivce/api'
import { useAuth } from '@/contexts/AuthContext'

// Updated interfaces to match your backend schemas
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

interface Student {
  _id: string
  studentID: string
  firstName: string
  lastName?: string
  grade: number
  section: string
  sessionExpiry?: Date | null
  email: string
}

interface Mark {
  _id: string
  studentID: string
  subject: string
  marksObtained: number
  totalMarks: number
  examType: 'Midterm' | 'Final' | 'Class Test'
  semester: string
  date: string
}

interface AttendanceRecord {
  _id: string
  date: string
  studentID: string
  totalDays: number
  totalPresent: number
  status: 'Present' | 'Absent'
}

interface Homework {
  _id: string
  studentID: string
  title: string
  description: string
  assignDate: string
  dueDate: string
  date: string
  createdAt?: string
}

interface Notice {
  _id: string
  classID: string
  teacherID: string
  title: string
  description: string
  date: string
}

interface CalendarEvent {
  _id: string
  title: string
  description?: string
  date: string
  category: 'Holiday' | 'Exam' | 'Event' | 'Reminder' | 'Other'
  createdAt: string
}

interface DashboardStats {
  totalStudents: number
  totalClasses: number
  pendingAssignments: number
  todayAttendance: number
  unreadNotifications: number
  averageMarks: number
  activeStudents: number
  recentNotices: number
}

interface RecentActivity {
  id: string
  type: 'assignment' | 'attendance' | 'marks' | 'notice'
  title: string
  description: string
  time: string
  class?: string
  priority?: 'low' | 'medium' | 'high'
}

interface UpcomingEvent {
  id: string
  title: string
  type: 'exam' | 'assignment' | 'meeting' | 'holiday' | 'event' | 'reminder' | 'other'
  date: string
  class?: string
  description?: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

export const Dashboard: React.FC = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalClasses: 0,
    pendingAssignments: 0,
    todayAttendance: 0,
    unreadNotifications: 0,
    averageMarks: 0,
    activeStudents: 0,
    recentNotices: 0
  })

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { teacher: authTeacher } = useAuth()

  // API functions using the api service
  const fetchTeacherProfile = async () => {
    try {
      const response = await api.getTeacherProfile()
      setTeacher(response.teacher)
    } catch (err) {
      console.error('Error fetching teacher profile:', err)
      setError('Failed to load teacher profile')
    }
  }

  const fetchAllStudents = async () => {
    try {
      const data = await api.getStudents()
      return data
    } catch (err) {
      console.error('Error fetching students:', err)
      return []
    }
  }

  const fetchAllHomework = async () => {
    try {
      const data = await api.getHomework()
      return data
    } catch (err) {
      console.error('Error fetching homework:', err)
      return []
    }
  }

  const fetchAllMarks = async () => {
    try {
      const data = await api.getAllMarks()
      return data
    } catch (err) {
      console.error('Error fetching marks:', err)
      return []
    }
  }

  const fetchAllAttendance = async () => {
    try {
      const data = await api.getAttendance()
      return data
    } catch (err) {
      console.error('Error fetching attendance:', err)
      return []
    }
  }

  const fetchTeacherNotices = async () => {
    try {
      const data = await api.getNotices()
      return data
    } catch (err) {
      console.error('Error fetching notices:', err)
      return []
    }
  }

  const fetchCalendarEvents = async () => {
    try {
      const data = await api.getCalendarEvents()
      return data
    } catch (err) {
      console.error('Error fetching calendar events:', err)
      return []
    }
  }

  // Calculate dashboard statistics
  const calculateStats = async () => {
    try {
      setLoading(true)
      
      const [students, homework, marks, attendance, notices, events] = await Promise.all([
        fetchAllStudents(),
        fetchAllHomework(),
        fetchAllMarks(),
        fetchAllAttendance(),
        fetchTeacherNotices(),
        fetchCalendarEvents()
      ])

      // Type assertions for API responses
      const typedStudents = students as Student[]
      const typedHomework = homework as Homework[]
      const typedMarks = marks as Mark[]
      const typedAttendance = attendance as AttendanceRecord[]
      const typedNotices = notices as Notice[]
      const typedEvents = events as CalendarEvent[]

      // Calculate total students
      const totalStudents = typedStudents.length
      
      // Calculate total classes (unique grade-section combinations)
      const uniqueClasses = new Set(typedStudents.map((s: Student) => `${s.grade}-${s.section}`))
      const totalClasses = uniqueClasses.size

      // Calculate pending assignments (homework created today)
      const today = new Date().toISOString().split('T')[0]
      const pendingAssignments = typedHomework.filter((h: Homework) =>
        h.date.split('T')[0] === today
      ).length

      // Calculate today's attendance
      const todayAttendance = calculateTodayAttendance(typedAttendance)

      // Calculate average marks
      const averageMarks = calculateAverageMarks(typedMarks)

      // Calculate active students (with recent login)
      const activeStudents = typedStudents.filter((s: Student) =>
        s.sessionExpiry && new Date(s.sessionExpiry) > new Date()
      ).length

      // Calculate recent notices
      const recentNotices = typedNotices.filter((n: Notice) => {
        const noticeDate = new Date(n.date)
        const daysDiff = (new Date().getTime() - noticeDate.getTime()) / (1000 * 3600 * 24)
        return daysDiff <= 7
      }).length

      setStats({
        totalStudents,
        totalClasses,
        pendingAssignments,
        todayAttendance,
        unreadNotifications: recentNotices,
        averageMarks,
        activeStudents,
        recentNotices
      })

      // Generate recent activities
      generateRecentActivities(typedHomework, typedAttendance, typedMarks, typedNotices)

      // Generate upcoming events
      generateUpcomingEvents(typedHomework, typedEvents)

    } catch (err) {
      console.error('Error calculating stats:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const calculateTodayAttendance = (attendanceRecords: AttendanceRecord[]) => {
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = attendanceRecords.filter(record => 
      record.date.split('T')[0] === today
    )

    if (todayRecords.length === 0) return 0

    const presentCount = todayRecords.filter(record => record.status === 'Present').length
    return Math.round((presentCount / todayRecords.length) * 100)
  }

  const calculateAverageMarks = (marks: Mark[]) => {
    if (marks.length === 0) return 0

    const totalPercentage = marks.reduce((sum, mark) => {
      return sum + (mark.marksObtained / mark.totalMarks) * 100
    }, 0)

    return Math.round(totalPercentage / marks.length)
  }

  const generateRecentActivities = (
    homework: Homework[], 
    attendance: AttendanceRecord[], 
    marks: Mark[], 
    notices: Notice[]
  ) => {
    const activities: RecentActivity[] = []

    // Recent homework
    homework.slice(0, 2).forEach(hw => {
      activities.push({
        id: hw._id,
        type: 'assignment',
        title: 'Assignment Created',
        description: hw.title,
        time: getRelativeTime(hw.date),
        class: `Student: ${hw.studentID}`
      })
    })

    // Recent attendance
    const recentAttendance = attendance
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2)
    
    recentAttendance.forEach(att => {
      activities.push({
        id: att._id,
        type: 'attendance',
        title: 'Attendance Marked',
        description: `${att.status} for student ${att.studentID}`,
        time: getRelativeTime(att.date),
        class: `Student: ${att.studentID}`
      })
    })

    // Recent marks
    marks.slice(0, 2).forEach(mark => {
      activities.push({
        id: mark._id,
        type: 'marks',
        title: 'Marks Entered',
        description: `${mark.subject}: ${mark.marksObtained}/${mark.totalMarks}`,
        time: getRelativeTime(mark.date),
        class: `Student: ${mark.studentID}`
      })
    })

    // Recent notices
    notices.slice(0, 2).forEach(notice => {
      activities.push({
        id: notice._id,
        type: 'notice',
        title: 'Notice Sent',
        description: notice.title,
        time: getRelativeTime(notice.date),
        class: notice.classID
      })
    })

    // Sort by time and take most recent
    setRecentActivities(activities.slice(0, 8))
  }

  const generateUpcomingEvents = (homework: Homework[], events: CalendarEvent[]) => {
    const upcomingEvents: UpcomingEvent[] = []

    // Upcoming homework due dates
    const now = new Date()
    homework
      .filter(hw => new Date(hw.dueDate) > now)
      .slice(0, 3)
      .forEach(hw => {
        upcomingEvents.push({
          id: hw._id,
          title: hw.title,
          type: 'assignment',
          date: hw.dueDate,
          class: `Student: ${hw.studentID}`,
          description: hw.description
        })
      })

    // Calendar events
    events
      .filter(event => new Date(event.date) > now)
      .slice(0, 5)
      .forEach(event => {
        upcomingEvents.push({
          id: event._id,
          title: event.title,
          type: event.category.toLowerCase() as any,
          date: event.date,
          description: event.description
        })
      })

    // Sort by date
    upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setUpcomingEvents(upcomingEvents.slice(0, 6))
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return format(date, 'MMM dd')
  }

  const getFullName = (teacher: Teacher) => {
    return `${teacher.firstName}${teacher.lastName ? ` ${teacher.lastName}` : ''}`
  }

  useEffect(() => {
    fetchTeacherProfile()
    calculateStats()
  }, [])

  const quickActions: QuickAction[] = [
    {
      id: 'attendance',
      title: 'Mark Attendance',
      description: 'Take attendance for your classes',
      icon: UserCheck,
      href: '/attendance',
      color: 'bg-blue-500'
    },
    {
      id: 'assignments',
      title: 'Create Assignment',
      description: 'Create new assignment for students',
      icon: BookOpen,
      href: '/assignments',
      color: 'bg-green-500'
    },
    {
      id: 'marks',
      title: 'Enter Marks',
      description: 'Enter marks for your students',
      icon: BarChart3,
      href: '/marks',
      color: 'bg-purple-500'
    },
    {
      id: 'notice',
      title: 'Send Notice',
      description: 'Send notice to students or parents',
      icon: Bell,
      href: '/notifications',
      color: 'bg-orange-500'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <BookOpen className="h-4 w-4" />
      case 'attendance':
        return <UserCheck className="h-4 w-4" />
      case 'marks':
        return <BarChart3 className="h-4 w-4" />
      case 'notice':
        return <Bell className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'assignment':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'meeting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'holiday':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'event':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-none space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-none space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back{teacher ? `, ${getFullName(teacher)}` : ''}! Here's your teaching overview for today.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM dd, yyyy')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4 text-blue-600" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalClasses} classes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <UserCheck className="mr-2 h-4 w-4 text-green-600" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.todayAttendance}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeStudents} active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-orange-600" />
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">Created today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-purple-600" />
              Average Marks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.averageMarks}%</div>
            <p className="text-xs text-muted-foreground">Class performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Bell className="mr-2 h-4 w-4 text-red-600" />
              Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.recentNotices}</div>
            <p className="text-xs text-muted-foreground">Sent this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-indigo-600" />
              Active Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">Classes you teach</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions for daily tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => window.location.href = action.href}
              >
                <div className={`p-2 rounded-full ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your teaching activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0 p-2 bg-muted rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{activity.title}</p>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      {activity.class && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {activity.class}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activities</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Important dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{event.title}</h4>
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {format(new Date(event.date), 'MMM dd, yyyy')}
                    </div>
                    {event.class && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {event.class}
                      </div>
                    )}
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
