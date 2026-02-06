'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Bell } from 'lucide-react'
import {
  getNotificationById,
  markNotificationRead,
} from '@/lib/actions/notifications'
import { toast } from 'sonner'

export default function NotificationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [notification, setNotification] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const notificationId = params.id as string

  useEffect(() => {
    async function fetchNotification() {
      if (!session?.user?.gymId || !notificationId) return

      setLoading(true)
      try {
        const result = await getNotificationById(
          session.user.gymId,
          notificationId
        )
        setNotification(result)
        if (!result.isRead) {
          await markNotificationRead(session.user.gymId, notificationId)
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load notification')
        router.push('/admin/notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotification()
  }, [session, notificationId, router])

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-4" aria-labelledby="notification-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/notifications')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to notifications
          </Button>
          <h1
            id="notification-title"
            className="mt-3 text-2xl font-semibold tracking-tight text-gray-900"
          >
            Notification
          </h1>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <CardTitle className="text-lg text-gray-900">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : notification ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {notification.title}
                </h2>
              </div>
              <p className="text-sm text-gray-600">{notification.message}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                <Badge className="bg-indigo-600">{notification.type}</Badge>
                <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
              </div>
              {notification.link && (
                <Button
                  variant="outline"
                  onClick={() => router.push(notification.link)}
                >
                  View related item
                </Button>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}
