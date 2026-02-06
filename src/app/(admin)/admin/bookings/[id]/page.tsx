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
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Mail,
  CheckCircle2,
  UserX,
  Ban,
} from 'lucide-react'
import { getBookingById, updateBookingStatus } from '@/lib/actions/bookings'
import { toast } from 'sonner'

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionLabel, setActionLabel] = useState<string | null>(null)
  const [actionStatus, setActionStatus] = useState<'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | null>(null)
  const [updating, setUpdating] = useState(false)

  const bookingId = params.id as string

  useEffect(() => {
    async function fetchBooking() {
      if (!session?.user?.gymId || !bookingId) return

      setLoading(true)
      try {
        const result = await getBookingById(session.user.gymId, bookingId)
        setBooking(result)
      } catch (error: any) {
        toast.error(error.message || 'Failed to load booking')
        router.push('/admin/bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [session, bookingId, router])

  const openActionDialog = (
    label: string,
    statusValue: 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  ) => {
    setActionLabel(label)
    setActionStatus(statusValue)
    setActionDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!session?.user?.gymId || !bookingId || !actionStatus) return

    setUpdating(true)
    try {
      await updateBookingStatus(session.user.gymId, bookingId, actionStatus)
      toast.success('Booking updated successfully')
      const refreshed = await getBookingById(session.user.gymId, bookingId)
      setBooking(refreshed)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update booking')
    } finally {
      setUpdating(false)
      setActionDialogOpen(false)
      setActionLabel(null)
      setActionStatus(null)
    }
  }

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-4" aria-labelledby="booking-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/bookings')}>
            <ArrowLeft className="h-4 w-4" />
            Back to bookings
          </Button>
          <h1 id="booking-title" className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
            Booking Details
          </h1>
        </div>
        {booking && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                openActionDialog(
                  `Mark ${booking.memberName} as completed?`,
                  'COMPLETED'
                )
              }
              disabled={booking.status === 'COMPLETED'}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark completed
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                openActionDialog(`Mark ${booking.memberName} as no-show?`, 'NO_SHOW')
              }
              disabled={booking.status === 'NO_SHOW'}
            >
              <UserX className="h-4 w-4" />
              Mark no-show
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                openActionDialog(`Cancel booking for ${booking.memberName}?`, 'CANCELLED')
              }
              disabled={booking.status === 'CANCELLED'}
            >
              <Ban className="h-4 w-4" />
              Cancel booking
            </Button>
          </div>
        )}
      </div>

      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <CardTitle className="text-lg text-gray-900">Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : booking ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">{booking.className}</h2>
                <p className="text-sm text-gray-600">
                  {booking.classDescription || 'No class description provided.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                    {booking.classCategory}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    {booking.classDuration} min
                  </span>
                </div>
              </div>
              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Booking date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(booking.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {booking && (
        <Card className="border-gray-200">
          <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
            <CardTitle className="text-lg text-gray-900">Session details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 pt-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>{new Date(booking.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>Session scheduled</span>
              </div>
            </div>
            <div className="space-y-4 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>{booking.trainerName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <span>{booking.trainerEmail}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        title="Update booking"
        description={actionLabel || 'Update booking status?'}
        confirmLabel="Confirm"
        variant="default"
        onConfirm={handleUpdateStatus}
        isLoading={updating}
      />
    </main>
  )
}
