import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Send, Calendar as CalendarIcon, Users, BookOpen, AlertCircle, CheckCircle, Clock, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'

// Updated interfaces to match your backend schemas
interface CalendarEvent {
  _id: string
  title: string
  description?: string
  date: string
  category: 'Holiday' | 'Exam' | 'Event' | 'Reminder' | 'Other'
  createdAt: string
}

interface Notice {
  _id: string
  classID: string
  teacherID: string
  title: string
  description: string
  date: string
}

// Form interfaces
interface NewNotice {
  classID: string
  title: string
  description: string
  date: string
}

interface NoticeStats {
  totalNotices: number
  todayNotices: number
  recentNotices: number
}

// Custom Calendar Component updated to work with backend data
const CustomCalendar: React.FC<{
  selectedDate: Date
  onDateSelect: (date: Date) => void
  events: CalendarEvent[]
}> = ({ selectedDate, onDateSelect, events }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateFormat = "d"
  const rows: JSX.Element[] = []

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const onDateClick = (day: Date) => {
    onDateSelect(day)
  }

  // Header with month navigation
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="sm" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Days of week header
  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return (
      <div className="grid grid-cols-7 border-b">
        {days.map((day, index) => (
          <div key={index} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
    )
  }

  // Calendar cells
  const renderCells = () => {
    let day = startDate
    const today = new Date()

    while (day <= endDate) {
      const week = []
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormat)
        const cloneDay = day
        const dayEvents = getEventsForDate(day)
        
        week.push(
          <div
            key={day.toString()}
            className={`
              min-h-[80px] p-2 border-r border-b cursor-pointer transition-colors hover:bg-accent
              ${!isSameMonth(day, monthStart) ? 'text-muted-foreground bg-muted/30' : 'bg-background'}
              ${isSameDay(day, selectedDate) ? 'bg-primary/10 border-primary' : ''}
              ${isSameDay(day, today) ? 'font-bold' : ''}
            `}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isSameDay(day, today) ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                {formattedDate}
              </span>
              {dayEvents.length > 0 && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
            </div>
            <div className="mt-1 space-y-1">
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event._id}
                  className={`
                    text-xs px-1 py-0.5 rounded truncate
                    ${event.category === 'Exam' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
                    ${event.category === 'Reminder' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' : ''}
                    ${event.category === 'Event' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                    ${event.category === 'Holiday' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
                    ${event.category === 'Other' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' : ''}
                  `}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {week}
        </div>
      )
    }
    return <div>{rows}</div>
  }

  return (
    <div className="border rounded-lg bg-background">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  )
}

export const Notifications: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCreateNotice, setShowCreateNotice] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state for creating notices
  const [newNotice, setNewNotice] = useState<NewNotice>({
    classID: '',
    title: '',
    description: '',
    date: new Date().toISOString()
  })

  const [formErrors, setFormErrors] = useState<Partial<NewNotice>>({})

  // This should come from your authentication context
  const currentTeacherID = 'TEACHER001' // Replace with actual authenticated teacher ID

  // Available classes - you might want to fetch this from an API
  const classes = ['Class-10-A', 'Class-10-B', 'Class-9-A', 'Class-9-B', 'Class-8-A']

  // API functions
  const fetchCalendarEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/calendar')
      if (!response.ok) throw new Error('Failed to fetch calendar events')
      const data = await response.json()
      setEvents(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching calendar events:', err)
      setError('Failed to load calendar events')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices', {
        headers: {
          'Authorization': `Bearer ${currentTeacherID}` // Adjust based on your auth setup
        }
      })
      if (!response.ok) throw new Error('Failed to fetch notices')
      const data = await response.json()
      setNotices(data)
    } catch (err) {
      console.error('Error fetching notices:', err)
      setError('Failed to load notices')
    }
  }

  const fetchNoticesByDate = async (date: Date) => {
    try {
      const response = await fetch('/api/notices/date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentTeacherID}`
        },
        body: JSON.stringify({
          date: format(date, 'yyyy-MM-dd')
        })
      })
      if (!response.ok) throw new Error('Failed to fetch notices by date')
      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error fetching notices by date:', err)
      return []
    }
  }

  const createNotice = async (noticeData: NewNotice) => {
    try {
      setSaving(true)
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentTeacherID}`
        },
        body: JSON.stringify(noticeData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create notice')
      }

      await fetchNotices() // Refresh notices
      return await response.json()
    } catch (err) {
      console.error('Error creating notice:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  const deleteNotice = async (noticeId: string) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/notices/${noticeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentTeacherID}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete notice')
      }

      await fetchNotices() // Refresh notices
    } catch (err) {
      console.error('Error deleting notice:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchCalendarEvents()
    fetchNotices()
  }, [])

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.date), date)
    )
  }

  // Get events for selected date
  const selectedDateEvents = getEventsForDate(selectedDate)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Exam':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'Reminder':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'Event':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'Holiday':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'Other':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  // Calculate statistics
  const getNoticeStats = (): NoticeStats => {
    const today = new Date().toISOString().split('T')[0]
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    return {
      totalNotices: notices.length,
      todayNotices: notices.filter(notice => notice.date.split('T')[0] === today).length,
      recentNotices: notices.filter(notice => notice.date.split('T')[0] >= lastWeek).length
    }
  }

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<NewNotice> = {}
    
    if (!newNotice.title.trim()) errors.title = 'Title is required'
    if (!newNotice.description.trim()) errors.description = 'Description is required'
    if (!newNotice.classID) errors.classID = 'Class is required'
    if (!newNotice.date) errors.date = 'Date is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await createNotice(newNotice)
      setShowCreateNotice(false)
      setNewNotice({
        classID: '',
        title: '',
        description: '',
        date: new Date().toISOString()
      })
      alert('Notice created successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to create notice')
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof NewNotice, value: string) => {
    setNewNotice(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // Handle delete notice
  const handleDeleteNotice = async (noticeId: string) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      try {
        await deleteNotice(noticeId)
        alert('Notice deleted successfully!')
      } catch (err: any) {
        setError(err.message || 'Failed to delete notice')
      }
    }
  }

  const stats = getNoticeStats()

  // Create Notice Dialog Component
  const CreateNoticeDialog = () => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Create Notice</DialogTitle>
        <DialogDescription>
          Create a new notice for your selected class
        </DialogDescription>
      </DialogHeader>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <AlertCircle className="h-4 w-4 mr-2 inline" />
          {error}
        </div>
      )}
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Title *</Label>
          <Input
            id="title"
            value={newNotice.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`col-span-3 ${formErrors.title ? 'border-red-500' : ''}`}
            placeholder="Enter notice title"
          />
          {formErrors.title && <p className="text-sm text-red-500 col-span-4 text-right">{formErrors.title}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="classID" className="text-right">Class *</Label>
          <Select value={newNotice.classID} onValueChange={(value) => handleInputChange('classID', value)}>
            <SelectTrigger className={`col-span-3 ${formErrors.classID ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.classID && <p className="text-sm text-red-500 col-span-4 text-right">{formErrors.classID}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">Date *</Label>
          <Input
            id="date"
            type="datetime-local"
            value={newNotice.date.slice(0, 16)}
            onChange={(e) => handleInputChange('date', new Date(e.target.value).toISOString())}
            className={`col-span-3 ${formErrors.date ? 'border-red-500' : ''}`}
          />
          {formErrors.date && <p className="text-sm text-red-500 col-span-4 text-right">{formErrors.date}</p>}
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="description" className="text-right pt-2">Description *</Label>
          <Textarea
            id="description"
            value={newNotice.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`col-span-3 ${formErrors.description ? 'border-red-500' : ''}`}
            placeholder="Enter notice description..."
            rows={4}
          />
          {formErrors.description && <p className="text-sm text-red-500 col-span-4 text-right">{formErrors.description}</p>}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setShowCreateNotice(false)} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {saving ? 'Creating...' : 'Create Notice'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Notifications & Calendar</h2>
          <p className="text-muted-foreground">
            View school calendar and manage your notices
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showCreateNotice} onOpenChange={setShowCreateNotice}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Notice
              </Button>
            </DialogTrigger>
            <CreateNoticeDialog />
          </Dialog>
        </div>
      </div>

      {/* Error Display */}
      {error && !showCreateNotice && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalNotices}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.todayNotices}</div>
            <p className="text-xs text-muted-foreground">Created today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.recentNotices}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Academic Calendar
              </CardTitle>
              <CardDescription>
                View school-wide events and holidays. Today is highlighted with a blue circle.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <CustomCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  events={events}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Events for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle>Events on {format(selectedDate, 'EEEE, MMM dd, yyyy')}</CardTitle>
            <CardDescription>
              {selectedDateEvents.length} event(s) scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div key={event._id} className="p-3 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-foreground">{event.title}</h4>
                          <Badge className={getCategoryColor(event.category)}>
                            {event.category}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        )}
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {format(new Date(event.date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No events scheduled for this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notice Board Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="mr-2 h-5 w-5" />
            My Notices
          </CardTitle>
          <CardDescription>
            Notices you have created for your classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : notices.length > 0 ? (
            <div className="space-y-4">
              {notices.map((notice) => (
                <Card key={notice._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-foreground">{notice.title}</h3>
                          <Badge variant="outline">{notice.classID}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {notice.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Users className="mr-1 h-3 w-3" />
                            {notice.classID}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {format(new Date(notice.date), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={saving}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this notice? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteNotice(notice._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Send className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Notices Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first notice to communicate with students
              </p>
              <Button onClick={() => setShowCreateNotice(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Notice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
