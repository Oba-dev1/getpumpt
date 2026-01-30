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
import { Input } from '@/components/ui/input'
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
import { RefreshCcw, X, Calendar, MoreVertical, CheckCircle2, Ban, UserX, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { getBookings, updateBookingStatus } from '@/lib/actions/bookings'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type BookingStatus = 'all' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'

export default function BookingsPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BookingStatus>('all')
  const [classId, setClassId] = useState('all')
  const [trainerId, setTrainerId] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [options, setOptions] = useState<{ classes: any[]; trainers: any[] }>({
    classes: [],
    trainers: [],
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBookings, setTotalBookings] = useState(0)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionLabel, setActionLabel] = useState<string | null>(null)
  const [actionStatus, setActionStatus] = useState<'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | null>(null)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchBookings = async () => {
    if (!session?.user?.gymId) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const result = await getBookings(session.user.gymId, {
        search: search || undefined,
        status: status === 'all' ? undefined : status,
        classId: classId === 'all' ? undefined : classId,
        trainerId: trainerId === 'all' ? undefined : trainerId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        page: currentPage,
        limit: 20,
      })

      setBookings(result.bookings)
      setTotalPages(result.totalPages)
      setTotalBookings(result.total)
    } catch (error) {
      setErrorMessage('Unable to load bookings right now.')
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [session, search, status, classId, trainerId, dateFrom, dateTo, currentPage])

  useEffect(() => {
    async function fetchOptions() {
      if (!session?.user?.gymId) return
      try {
        const { getBookingFormOptions } = await import('@/lib/actions/bookings-form')
        const result = await getBookingFormOptions(session.user.gymId)
        setOptions({ classes: result.classes, trainers: result.trainers })
      } catch (error) {
        toast.error('Failed to load filter options')
      }
    }

    fetchOptions()
  }, [session])

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
    setClassId('all')
    setTrainerId('all')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const openActionDialog = (
    bookingId: string,
    label: string,
    statusValue: 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  ) => {
    setSelectedBookingId(bookingId)
    setActionLabel(label)
    setActionStatus(statusValue)
    setActionDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!session?.user?.gymId || !selectedBookingId || !actionStatus) return

    setUpdating(true)
    try {
      await updateBookingStatus(session.user.gymId, selectedBookingId, actionStatus)
      toast.success('Booking updated successfully')
      await fetchBookings()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update booking')
    } finally {
      setUpdating(false)
      setActionDialogOpen(false)
      setSelectedBookingId(null)
      setActionLabel(null)
      setActionStatus(null)
    }
  }

  const emptyStateCopy = useMemo(() => {
    if (search || status !== 'all' || classId !== 'all' || trainerId !== 'all' || dateFrom || dateTo) {
      return 'No bookings match your filters.'
    }
    return 'No bookings recorded yet.'
  }, [search, status, classId, trainerId, dateFrom, dateTo])

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-6" aria-labelledby="bookings-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="bookings-title" className="text-3xl font-semibold text-gray-900">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-gray-600" aria-live="polite">
            {loading ? 'Loading bookings...' : `${totalBookings} bookings found`}
          </p>
        </div>
        <Button variant="gym" onClick={() => router.push('/admin/bookings/new')}>
          <Plus className="h-4 w-4" />
          Create Booking
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="flex flex-col gap-4 rounded-t-xl border-b border-gray-200 bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg text-gray-900">Filters</CardTitle>
          {(search || status !== 'all' || classId !== 'all' || trainerId !== 'all' || dateFrom || dateTo) && (
            <Button variant="link" className="h-auto px-0 text-sm" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            placeholder="Search by member, class, or trainer..."
            ariaLabel="Search bookings by member, class, or trainer"
            onSearch={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            className="w-full lg:w-96"
            defaultValue={search}
          />
          <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
            <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No-show</SelectItem>
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
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <label className="sr-only" htmlFor="dateFrom">From date</label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-40"
                />
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <label className="sr-only" htmlFor="dateTo">To date</label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-40"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="bookings-table">
        <h2 id="bookings-table" className="sr-only">
          Bookings list
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
              <Button variant="outline" onClick={fetchBookings}>
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">{emptyStateCopy}</p>
              {(search || status !== 'all') && (
                <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <caption className="sr-only">Class bookings</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Member</TableHead>
                    <TableHead scope="col">Class</TableHead>
                    <TableHead scope="col">Trainer</TableHead>
                    <TableHead scope="col">Date</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col" className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium text-gray-900">
                        <Button
                          variant="link"
                          className="h-auto px-0 text-left text-gray-900"
                          onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                        >
                          <div className="flex flex-col">
                            <span>{booking.memberName}</span>
                            <span className="text-xs text-gray-500">{booking.memberEmail}</span>
                          </div>
                        </Button>
                      </TableCell>
                      <TableCell className="text-gray-700">{booking.className}</TableCell>
                      <TableCell className="text-gray-700">{booking.trainerName}</TableCell>
                      <TableCell className="text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Open actions for ${booking.memberName}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                            >
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openActionDialog(
                                  booking.id,
                                  `Mark ${booking.memberName} as completed?`,
                                  'COMPLETED'
                                )
                              }
                              disabled={booking.status === 'COMPLETED'}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openActionDialog(
                                  booking.id,
                                  `Mark ${booking.memberName} as no-show?`,
                                  'NO_SHOW'
                                )
                              }
                              disabled={booking.status === 'NO_SHOW'}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Mark no-show
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openActionDialog(
                                  booking.id,
                                  `Cancel booking for ${booking.memberName}?`,
                                  'CANCELLED'
                                )
                              }
                              className="text-red-600"
                              disabled={booking.status === 'CANCELLED'}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Cancel booking
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
                totalItems={totalBookings}
                itemsPerPage={20}
              />
            </>
          )}
        </div>
      </section>
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
