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
  Edit,
  Trash2,
  Mail,
  Phone,
  Award,
  Calendar,
  Clock,
} from 'lucide-react'
import { getTrainerById, deleteTrainer, toggleTrainerStatus } from '@/lib/actions/trainers'
import { toast } from 'sonner'

export default function TrainerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [trainer, setTrainer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  const trainerId = params.id as string

  useEffect(() => {
    async function fetchTrainer() {
      if (!session?.user?.gymId || !trainerId) return

      setLoading(true)
      try {
        const result = await getTrainerById(session.user.gymId, trainerId)
        setTrainer(result)
      } catch (error: any) {
        toast.error(error.message || 'Failed to load trainer')
        router.push('/admin/trainers')
      } finally {
        setLoading(false)
      }
    }

    fetchTrainer()
  }, [session, trainerId, router])

  const handleDelete = async () => {
    if (!session?.user?.gymId || !trainerId) return

    setDeleting(true)
    try {
      await deleteTrainer(session.user.gymId, trainerId)
      toast.success('Trainer deleted successfully')
      router.push('/admin/trainers')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete trainer')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!session?.user?.gymId || !trainerId) return

    setToggling(true)
    try {
      await toggleTrainerStatus(session.user.gymId, trainerId)
      const refreshed = await getTrainerById(session.user.gymId, trainerId)
      setTrainer(refreshed)
      toast.success('Trainer status updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update trainer status')
    } finally {
      setToggling(false)
    }
  }

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-4" aria-labelledby="trainer-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/trainers')}>
            <ArrowLeft className="h-4 w-4" />
            Back to trainers
          </Button>
          <h1 id="trainer-title" className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
            Trainer Details
          </h1>
        </div>
        {trainer && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push(`/admin/trainers/${trainerId}/edit`)}>
              <Edit className="h-4 w-4" />
              Edit trainer
            </Button>
            <Button variant="outline" onClick={handleToggleStatus} disabled={toggling}>
              {trainer.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={trainer.schedulesCount > 0}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <CardTitle className="text-lg text-gray-900">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : trainer ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {trainer.firstName} {trainer.lastName}
                </h2>
                {trainer.bio ? (
                  <p className="text-sm text-gray-600">{trainer.bio}</p>
                ) : (
                  <p className="text-sm text-gray-500">No bio provided.</p>
                )}
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <span>{trainer.email}</span>
                  </div>
                  {trainer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      <span>{trainer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <StatusBadge status={trainer.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Schedules</span>
                  <span className="text-sm font-medium text-gray-900">{trainer.schedulesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Experience</span>
                  <span className="text-sm font-medium text-gray-900">
                    {trainer.yearsExperience ? `${trainer.yearsExperience} yrs` : '—'}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {trainer && (
        <Card className="border-gray-200">
          <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
            <CardTitle className="text-lg text-gray-900">Specialties and certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-2">
              {trainer.specialties.length > 0 ? (
                trainer.specialties.map((specialty: string) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700"
                  >
                    <Award className="h-3 w-3" aria-hidden="true" />
                    {specialty}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No specialties listed.</span>
              )}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium text-gray-900">Certifications:</span>{' '}
              {trainer.certifications.length > 0
                ? trainer.certifications.join(', ')
                : 'None provided'}
            </div>
          </CardContent>
        </Card>
      )}

      {trainer && (
        <Card className="border-gray-200">
          <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
            <CardTitle className="text-lg text-gray-900">Upcoming schedules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {trainer.schedulesPreview.length === 0 ? (
              <p className="text-sm text-gray-500">No schedules assigned.</p>
            ) : (
              <div className="space-y-3">
                {trainer.schedulesPreview.map((schedule: any) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{schedule.className}</p>
                      <p className="text-xs text-gray-500">
                        {schedule.dayOfWeek.charAt(0) + schedule.dayOfWeek.slice(1).toLowerCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                  </div>
                ))}
                {trainer.schedulesCount > trainer.schedulesPreview.length && (
                  <Button
                    variant="link"
                    className="h-auto px-0 text-sm"
                    onClick={() => router.push('/admin/schedules')}
                  >
                    View all schedules
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Trainer"
        description={
          trainer?.schedulesCount > 0
            ? 'Cannot delete this trainer while they have scheduled classes.'
            : 'Are you sure you want to delete this trainer? This action cannot be undone.'
        }
        confirmLabel={trainer?.schedulesCount > 0 ? 'OK' : 'Delete'}
        variant={trainer?.schedulesCount > 0 ? 'default' : 'destructive'}
        onConfirm={trainer?.schedulesCount > 0 ? () => setDeleteDialogOpen(false) : handleDelete}
        isLoading={deleting}
      />
    </main>
  )
}
