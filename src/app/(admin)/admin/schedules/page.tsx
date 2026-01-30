'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/admin/SearchInput'
import { Pagination } from '@/components/admin/Pagination'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus,
  RefreshCcw,
  X,
  Clock,
  MapPin,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Power,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getGymSchedules,
  getScheduleFormOptions,
  deleteGymSchedule,
  toggleGymScheduleStatus,
} from '@/lib/actions/schedules'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type StatusFilter = 'all' | 'ACTIVE' | 'INACTIVE'

const days = [
  { value: 'all', label: 'All Days' },
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
]

export default function SchedulesPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [dayOfWeek, setDayOfWeek] = useState('all')
  const [classId, setClassId] = useState('all')
  const [trainerId, setTrainerId] = useState('all')
  const [options, setOptions] = useState<{ classes: any[]; trainers: any[] }>({
    classes: [],
    trainers: [],
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSchedules, setTotalSchedules] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [selectedScheduleLabel, setSelectedScheduleLabel] = useState<string | null>(null)
  const [selectedScheduleHasBookings, setSelectedScheduleHasBookings] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchSchedules = async () => {
    if (!session?.user?.gymId) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const result = await getGymSchedules(session.user.gymId, {
        classId: classId === 'all' ? undefined : classId,
        trainerId: trainerId === 'all' ? undefined : trainerId,
        dayOfWeek: dayOfWeek === 'all' ? undefined : dayOfWeek,
        status: status === 'all' ? undefined : status,
        page: currentPage,
        limit: 20,
      })

      let filtered = result.schedules
      if (search) {
        const term = search.toLowerCase()
        filtered = result.schedules.filter(
          (schedule: any) =>
            schedule.className.toLowerCase().includes(term) ||
            schedule.trainerName.toLowerCase().includes(term) ||
            schedule.location?.toLowerCase().includes(term)
        )
      }

      setSchedules(filtered)
      setTotalPages(result.totalPages)
      setTotalSchedules(result.total)
    } catch (error) {
      setErrorMessage('Unable to load schedules right now.')
      toast.error('Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    if (!session?.user?.gymId) return

    try {
      const result = await getScheduleFormOptions(session.user.gymId)
      setOptions(result)
    } catch (error) {
      toast.error('Failed to load class and trainer options')
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [session])

  useEffect(() => {
    fetchSchedules()
  }, [session, search, status, dayOfWeek, classId, trainerId, currentPage])

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
    setDayOfWeek('all')
    setClassId('all')
    setTrainerId('all')
    setCurrentPage(1)
  }

  const openDeleteDialog = (schedule: any) => {
    setSelectedScheduleId(schedule.id)
    setSelectedScheduleLabel(`${schedule.className} (${schedule.dayOfWeek})`)
    setSelectedScheduleHasBookings(schedule.bookingCount > 0)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!session?.user?.gymId || !selectedScheduleId) return

    setDeleting(true)
    try {
      await deleteGymSchedule(session.user.gymId, selectedScheduleId)
      toast.success('Schedule deleted successfully')
      await fetchSchedules()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete schedule')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedScheduleId(null)
      setSelectedScheduleLabel(null)
      setSelectedScheduleHasBookings(false)
    }
  }

  const handleToggleStatus = async (scheduleId: string) => {
    if (!session?.user?.gymId) return

    setToggling(scheduleId)
    try {
      await toggleGymScheduleStatus(session.user.gymId, scheduleId)
      toast.success('Schedule status updated')
      await fetchSchedules()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update schedule status')
    } finally {
      setToggling(null)
    }
  }

  const emptyStateCopy = useMemo(() => {
    if (search || status !== 'all' || dayOfWeek !== 'all' || classId !== 'all' || trainerId !== 'all') {
      return 'No schedules match your filters.'
    }
    return 'No schedules created yet.'
  }, [search, status, dayOfWeek, classId, trainerId])

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-6" aria-labelledby="schedules-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="schedules-title" className="text-3xl font-semibold text-gray-900">
            Schedules
          </h1>
          <p className="mt-1 text-sm text-gray-600" aria-live="polite">
            {loading ? 'Loading schedules...' : `${totalSchedules} schedules found`}
          </p>
        </div>
        <Button variant="gym" onClick={() => router.push('/admin/schedules/new')}>
          <Plus className="h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="flex flex-col gap-4 rounded-t-xl border-b border-gray-200 bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg text-gray-900">Filters</CardTitle>
          {(search || status !== 'all' || dayOfWeek !== 'all' || classId !== 'all' || trainerId !== 'all') && (
            <Button variant="link" className="h-auto px-0 text-sm" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            placeholder="Search schedules..."
            ariaLabel="Search by class, trainer, or location"
            onSearch={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            className="w-full lg:w-96"
            defaultValue={search}
          />
          <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
            <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {options.classes.map((gymClass) => (
                  <SelectItem key={gymClass.id} value={gymClass.id}>
                    {gymClass.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={trainerId} onValueChange={setTrainerId}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Trainer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainers</SelectItem>
                {options.trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="schedules-table">
        <h2 id="schedules-table" className="sr-only">
          Schedules list
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white">
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
              <Button variant="outline" onClick={fetchSchedules}>
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">{emptyStateCopy}</p>
              {search || status !== 'all' || dayOfWeek !== 'all' || classId !== 'all' || trainerId !== 'all' ? (
                <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/admin/schedules/new')}
                >
                  Create your first schedule
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <caption className="sr-only">Class schedules</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Class</TableHead>
                    <TableHead scope="col">Trainer</TableHead>
                    <TableHead scope="col">Day</TableHead>
                    <TableHead scope="col">Time</TableHead>
                    <TableHead scope="col">Capacity</TableHead>
                    <TableHead scope="col">Location</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col" className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium text-gray-900">
                        <Button
                          variant="link"
                          className="h-auto px-0 text-left text-gray-900"
                          onClick={() => router.push(`/admin/schedules/${schedule.id}`)}
                        >
                          {schedule.className}
                        </Button>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {schedule.trainerName}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {schedule.dayOfWeek.charAt(0) + schedule.dayOfWeek.slice(1).toLowerCase()}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          {schedule.maxCapacity}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          {schedule.location || 'Main studio'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={schedule.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Open actions for ${schedule.className}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/schedules/${schedule.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(schedule.id)}
                              disabled={toggling === schedule.id}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {schedule.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(schedule)}
                              className="text-red-600"
                              disabled={schedule.bookingCount > 0}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalSchedules}
                itemsPerPage={20}
              />
            </>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Schedule"
        description={
          selectedScheduleHasBookings
            ? `Cannot delete "${selectedScheduleLabel}" while it has bookings.`
            : `Are you sure you want to delete "${selectedScheduleLabel}"? This action cannot be undone.`
        }
        confirmLabel={selectedScheduleHasBookings ? 'OK' : 'Delete'}
        variant={selectedScheduleHasBookings ? 'default' : 'destructive'}
        onConfirm={selectedScheduleHasBookings ? () => setDeleteDialogOpen(false) : handleDelete}
        isLoading={deleting}
      />
    </main>
  )
}
