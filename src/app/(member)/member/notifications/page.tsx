import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { MemberActionForm } from '@/components/member/MemberActionForm'
import { MemberActionProvider } from '@/components/member/MemberActionContext'
import { MemberActionButton } from '@/components/member/MemberActionButton'
import {
  getMemberNotifications,
  markAllMemberNotificationsReadAction,
  markMemberNotificationReadAction,
} from '@/lib/actions/member-portal'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const notifications = await getMemberNotifications()
  const unreadCount = notifications.filter((item) => !item.isRead).length

  return (
    <main className="member-stack" aria-labelledby="member-notifications-title">
      <MemberActionProvider>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              id="member-notifications-title"
              className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Notifications
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              You have {unreadCount} unread notification(s).
            </p>
          </div>
          {unreadCount > 0 ? (
            <MemberActionForm action={markAllMemberNotificationsReadAction}>
              <MemberActionButton variant="outline" className="h-9 px-4 text-sm" pendingText="Updating...">
                Mark all as read
              </MemberActionButton>
            </MemberActionForm>
          ) : null}
        </header>

      <Card className="member-card">
        <CardHeader className="member-card-header">
          <CardTitle className="text-base text-white">Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent className="member-card-content space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg border p-3 ${
                    notification.isRead
                      ? 'border-white/10 bg-slate-950/40'
                      : 'border-cyan-500/40 bg-slate-900/80'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(notification.createdAt, 'long')}
                      </p>
                    </div>
                    {!notification.isRead ? (
                      <MemberActionForm action={markMemberNotificationReadAction}>
                        <input type="hidden" name="notificationId" value={notification.id} />
                        <MemberActionButton variant="outline" size="sm" pendingText="Saving...">
                          Mark read
                        </MemberActionButton>
                      </MemberActionForm>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </MemberActionProvider>
    </main>
  )
}
