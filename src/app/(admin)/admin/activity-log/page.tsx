'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { RefreshCcw, X, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { getActivityLogs, getActivityLogStaff } from '@/lib/actions/activity-log'

interface ActivityLogEntry {
  id: string
  action: string
  resourceType: string
  resourceId: string | null
  description: string
  metadata: unknown
  createdAt: Date
  user: {
    id: string
    firstName: string
    lastName: string
    role: string
    avatar: string | null
  }
}

interface StaffOption {
  id: string
  firstName: string
  lastName: string
  role: string
}

const RESOURCE_TYPES = [
  { value: 'all', label: 'All Resources' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'PLAN', label: 'Plan' },
  { value: 'CLASS', label: 'Class' },
  { value: 'SCHEDULE', label: 'Schedule' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'TRAINER', label: 'Trainer' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'NOTIFICATION', label: 'Notification' },
  { value: 'SETTING', label: 'Setting' },
  { value: 'CHECK_IN', label: 'Check In' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'TESTIMONIAL', label: 'Testimonial' },
]

const ACTION_STYLES: Record<string, string> = {
  CREATE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  UPDATE: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/20',
}

function ActionBadge({ action }: { action: string }) {
  const style = ACTION_STYLES[action] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/20'
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${style}`}>
      {action}
    </span>
  )
}

function ResourceTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-slate-300">
      {type.replace(/_/g, ' ')}
    </span>
  )
}

export default function ActivityLogPage() {
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])
  const [staffList, setStaffList] = useState<StaffOption[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [resourceType, setResourceType] = useState('all')
  const [staffFilter, setStaffFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)

  const fetchLogs = async () => {
    if (!session?.user?.gymId) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const result = await getActivityLogs({
        gymId: session.user.gymId,
        search: search || undefined,
        resourceType: resourceType === 'all' ? undefined : resourceType,
        userId: staffFilter === 'all' ? undefined : staffFilter,
        startDate: dateFrom ? new Date(dateFrom) : undefined,
        endDate: dateTo ? new Date(`${dateTo}T23:59:59`) : undefined,
        page: currentPage,
        limit: 25,
      })

      setLogs(result.logs as ActivityLogEntry[])
      setTotalPages(result.totalPages)
      setTotalLogs(result.total)
    } catch {
      setErrorMessage('Unable to load activity logs right now.')
      toast.error('Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    if (!session?.user?.gymId) return
    try {
      const result = await getActivityLogStaff(session.user.gymId)
      setStaffList(result)
    } catch {
      // Non-critical, staff filter just won't be available
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [session?.user?.gymId])

  useEffect(() => {
    fetchLogs()
  }, [session, search, resourceType, staffFilter, dateFrom, dateTo, currentPage])

  const handleClearFilters = () => {
    setSearch('')
    setResourceType('all')
    setStaffFilter('all')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const hasFilters = search || resourceType !== 'all' || staffFilter !== 'all' || dateFrom || dateTo

  const emptyStateCopy = useMemo(() => {
    if (hasFilters) {
      return 'No activity logs match your filters.'
    }
    return 'No activity recorded yet.'
  }, [hasFilters])

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-4" aria-labelledby="activity-log-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="activity-log-title" className="text-2xl font-semibold tracking-tight text-gray-900">
            Activity Log
          </h1>
          <p className="mt-1 text-sm text-gray-600" aria-live="polite">
            {loading ? 'Loading activity logs...' : `${totalLogs} entries found`}
          </p>
        </div>
      </div>

      <Card className="border-gray-200 bg-slate-950/90">
        <CardHeader className="flex flex-col gap-3 rounded-t-xl border-b border-gray-200 bg-slate-900/90 py-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base text-gray-900">Filters</CardTitle>
          {hasFilters && (
            <Button variant="link" className="h-auto px-0 text-sm" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            placeholder="Search activity..."
            ariaLabel="Search activity logs"
            onSearch={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            className="w-full lg:w-96"
            defaultValue={search}
          />
          <div className="flex w-full flex-wrap items-center gap-2.5 lg:w-auto">
            <Select value={resourceType} onValueChange={(value) => { setResourceType(value); setCurrentPage(1) }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={staffFilter} onValueChange={(value) => { setStaffFilter(value); setCurrentPage(1) }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Staff Member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.firstName} {staff.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <label className="sr-only" htmlFor="activityFrom">From date</label>
                <Input
                  id="activityFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-36"
                />
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <label className="sr-only" htmlFor="activityTo">To date</label>
                <Input
                  id="activityTo"
                  type="date"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-36"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="activity-table">
        <h2 id="activity-table" className="sr-only">
          Activity log entries
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
              <Button variant="outline" onClick={fetchLogs}>
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">{emptyStateCopy}</p>
              {hasFilters && (
                <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <caption className="sr-only">Activity log records</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Date / Time</TableHead>
                    <TableHead scope="col">Staff</TableHead>
                    <TableHead scope="col">Action</TableHead>
                    <TableHead scope="col">Resource</TableHead>
                    <TableHead scope="col">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-gray-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>{log.user.firstName} {log.user.lastName}</span>
                          <span className="text-xs text-gray-500">{log.user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ActionBadge action={log.action} />
                      </TableCell>
                      <TableCell>
                        <ResourceTypeBadge type={log.resourceType} />
                      </TableCell>
                      <TableCell className="text-gray-700 max-w-xs truncate">
                        {log.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalLogs}
                itemsPerPage={25}
              />
            </>
          )}
        </div>
      </section>
    </main>
  )
}
