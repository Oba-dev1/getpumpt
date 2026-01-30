'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { ArrowLeft, Edit, Trash2, Clock, MapPin, Users, Calendar, Mail } from 'lucide-react'
import { getGymScheduleById, deleteGymSchedule } from '@/lib/actions/schedules'
import { toast } from 'sonner'

export default function ScheduleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [schedule, setSchedule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const scheduleId = params.id as string

  useEffect(() => {
    async function fetchSchedule() {
      if (!session?.user?.gymId || !scheduleId) return

      setLoading(true)
      try {
        const result = await getGymScheduleById(session.user.gymId, scheduleId)
        setSchedule(result)
      } catch (error: any) {
        toast.error(error.message || 'Failed to load schedule')
        router.push('/admin/schedules')
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [session, scheduleId, router])

  const handleDelete = async () => {
    if (!session?.user?.gymId || !scheduleId) return

    setDeleting(true)
    try {
      await deleteGymSchedule(session.user.gymId, scheduleId)
      toast.success('Schedule deleted successfully')
      router.push('/admin/schedules')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete schedule')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-6" aria-labelledby="schedule-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/schedules')}>
            <ArrowLeft className="h-4 w-4" />
            Back to schedules
          </Button>
          <h1 id="schedule-title" className="mt-4 text-3xl font-semibold text-gray-900">
            Schedule Details
          </h1>
        </div>
        {schedule && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push(`/admin/schedules/${scheduleId}/edit`)}>
              <Edit className="h-4 w-4" />
              Edit schedule
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={schedule.bookingCount > 0}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <CardTitle className="text-lg text-gray-900">Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : schedule ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">{schedule.className}</h2>
                <p className="text-sm text-gray-600">
                  {schedule.classDescription || 'No class description provided.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                    {schedule.classCategory}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    {schedule.classDuration} min
                  </span>
                </div>
              </div>
              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <StatusBadge status={schedule.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bookings</span>
                  <span className="text-sm font-medium text-gray-900">{schedule.bookingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Capacity</span>
                  <span className="text-sm font-medium text-gray-900">{schedule.maxCapacity}</span>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {schedule && (
        <Card className="border-gray-200">
          <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
            <CardTitle className="text-lg text-gray-900">Session details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>
                  {schedule.dayOfWeek.charAt(0) + schedule.dayOfWeek.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>{schedule.startTime} - {schedule.endTime}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>{schedule.location || 'Main studio'}</span>
              </div>
            </div>
            <div className="space-y-4 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>{schedule.trainerName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>{schedule.trainerEmail}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Schedule"
        description={
          schedule?.bookingCount > 0
            ? 'Cannot delete this schedule while it has bookings.'
            : 'Are you sure you want to delete this schedule? This action cannot be undone.'
        }
        confirmLabel={schedule?.bookingCount > 0 ? 'OK' : 'Delete'}
        variant={schedule?.bookingCount > 0 ? 'default' : 'destructive'}
        onConfirm={schedule?.bookingCount > 0 ? () => setDeleteDialogOpen(false) : handleDelete}
        isLoading={deleting}
      />
    </main>
  )
}
