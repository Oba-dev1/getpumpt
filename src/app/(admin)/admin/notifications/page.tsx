'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/admin/SearchInput'
import { Pagination } from '@/components/admin/Pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCcw, X, Bell, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/actions/notifications'

type NotificationStatus = 'all' | 'READ' | 'UNREAD'

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'MEMBERSHIP', label: 'Membership' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'GENERAL', label: 'General' },
  { value: 'PROMO', label: 'Promo' },
]

export default function NotificationsPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<NotificationStatus>('all')
  const [type, setType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = async () => {
    if (!session?.user?.gymId) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const result = await getNotifications(session.user.gymId, {
        search: search || undefined,
        status: status === 'all' ? undefined : status,
        type: type === 'all' ? undefined : type,
        page: currentPage,
        limit: 20,
      })

      setNotifications(result.notifications)
      setTotalPages(result.totalPages)
      setTotalNotifications(result.total)
      setUnreadCount(result.unreadCount)
    } catch (error) {
      setErrorMessage('Unable to load notifications right now.')
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [session, search, status, type, currentPage])

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
    setType('all')
    setCurrentPage(1)
  }

  const handleMarkAllRead = async () => {
    if (!session?.user?.gymId) return

    setMarkingAll(true)
    try {
      await markAllNotificationsRead(session.user.gymId)
      toast.success('All notifications marked as read')
      await fetchNotifications()
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark all as read')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleMarkRead = async (notificationId: string) => {
    if (!session?.user?.gymId) return

    try {
      await markNotificationRead(session.user.gymId, notificationId)
      await fetchNotifications()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notification')
    }
  }

  const emptyStateCopy = useMemo(() => {
    if (search || status !== 'all' || type !== 'all') {
      return 'No notifications match your filters.'
    }
    return 'No notifications yet.'
  }, [search, status, type])

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-4" aria-labelledby="notifications-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="notifications-title" className="text-2xl font-semibold tracking-tight text-gray-900">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-600" aria-live="polite">
            {loading ? 'Loading notifications...' : `${totalNotifications} notifications`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark all read
          </Button>
          <Badge className="bg-indigo-600">
            <Bell className="mr-2 h-3 w-3" />
            {unreadCount} unread
          </Badge>
        </div>
      </div>

      <Card className="border-gray-200 bg-slate-950/90">
        <CardHeader className="flex flex-col gap-3 rounded-t-xl border-b border-gray-200 bg-slate-900/90 py-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base text-gray-900">Filters</CardTitle>
          {(search || status !== 'all' || type !== 'all') && (
            <Button variant="link" className="h-auto px-0 text-sm" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            placeholder="Search notifications..."
            ariaLabel="Search notifications by title or message"
            onSearch={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            className="w-full sm:w-96"
            defaultValue={search}
          />
          <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
            <Select value={status} onValueChange={(value) => setStatus(value as NotificationStatus)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="UNREAD">Unread</SelectItem>
                <SelectItem value="READ">Read</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="notifications-table">
        <h2 id="notifications-table" className="sr-only">
          Notifications list
        </h2>
        <div className="rounded-lg border border-gray-200 bg-slate-950/90">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : errorMessage ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <p className="text-sm text-gray-600">{errorMessage}</p>
              <Button variant="outline" onClick={fetchNotifications}>
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">{emptyStateCopy}</p>
              {(search || status !== 'all' || type !== 'all') && (
                <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <caption className="sr-only">Notification log</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Notification</TableHead>
                    <TableHead scope="col">Type</TableHead>
                    <TableHead scope="col">Date</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col" className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium text-gray-900">
                        <Button
                          variant="link"
                          className="h-auto px-0 text-left text-gray-900"
                          onClick={() => router.push(`/admin/notifications/${notification.id}`)}
                        >
                          <div className="flex flex-col">
                            <span>{notification.title}</span>
                            <span className="text-xs text-gray-500">{notification.message}</span>
                          </div>
                        </Button>
                      </TableCell>
                      <TableCell className="text-gray-700">{notification.type}</TableCell>
                      <TableCell className="text-gray-700">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={notification.isRead ? 'bg-gray-200 text-gray-700' : 'bg-indigo-600'}>
                          {notification.isRead ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={notification.isRead}
                          onClick={() => handleMarkRead(notification.id)}
                        >
                          Mark read
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalNotifications}
                itemsPerPage={20}
              />
            </>
          )}
        </div>
      </section>
    </main>
  )
}
