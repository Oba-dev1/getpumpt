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
  Dumbbell,
  Clock,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Power,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getGymClasses,
  deleteGymClass,
  toggleGymClassStatus,
} from '@/lib/actions/classes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ClassStatusFilter = 'all' | 'ACTIVE' | 'INACTIVE'
type SortOption = 'created_desc' | 'created_asc' | 'name_asc' | 'name_desc'

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'HIIT', label: 'HIIT' },
  { value: 'YOGA', label: 'Yoga' },
  { value: 'STRENGTH', label: 'Strength' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'SPIN', label: 'Spin' },
  { value: 'CROSSFIT', label: 'CrossFit' },
  { value: 'PILATES', label: 'Pilates' },
  { value: 'BOXING', label: 'Boxing' },
  { value: 'DANCE', label: 'Dance' },
  { value: 'OTHER', label: 'Other' },
]

export default function ClassesPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ClassStatusFilter>('all')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState<SortOption>('created_desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalClasses, setTotalClasses] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null)
  const [selectedClassHasSchedules, setSelectedClassHasSchedules] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const [sortBy, sortDir] = sort.split('_') as ['created' | 'name', 'asc' | 'desc']

  const fetchClasses = async () => {
    if (!session?.user?.gymId) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const result = await getGymClasses(session.user.gymId, {
        search: search || undefined,
        status: status === 'all' ? undefined : status,
        category: category === 'all' ? undefined : category,
        sortBy: sortBy === 'name' ? 'NAME' : 'CREATED',
        sortDir,
        page: currentPage,
        limit: 20,
      })

      setClasses(result.classes)
      setTotalPages(result.totalPages)
      setTotalClasses(result.total)
    } catch (error) {
      setErrorMessage('Unable to load classes right now.')
      toast.error('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [session, search, status, category, sort, currentPage])

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
    setCategory('all')
    setSort('created_desc')
    setCurrentPage(1)
  }

  const openDeleteDialog = (gymClass: any) => {
    setSelectedClassId(gymClass.id)
    setSelectedClassName(gymClass.name)
    setSelectedClassHasSchedules(gymClass.schedules > 0)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!session?.user?.gymId || !selectedClassId) return

    setDeleting(true)
    try {
      await deleteGymClass(session.user.gymId, selectedClassId)
      toast.success('Class deleted successfully')
      await fetchClasses()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete class')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedClassId(null)
      setSelectedClassName(null)
      setSelectedClassHasSchedules(false)
    }
  }

  const handleToggleStatus = async (classId: string) => {
    if (!session?.user?.gymId) return

    setToggling(classId)
    try {
      await toggleGymClassStatus(session.user.gymId, classId)
      toast.success('Class status updated')
      await fetchClasses()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update class status')
    } finally {
      setToggling(null)
    }
  }

  const emptyStateCopy = useMemo(() => {
    if (search || status !== 'all' || category !== 'all') {
      return 'No classes match your filters.'
    }
    return 'No classes created yet.'
  }, [search, status, category])

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-6" aria-labelledby="classes-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="classes-title" className="text-3xl font-semibold text-gray-900">
            Classes
          </h1>
          <p className="mt-1 text-sm text-gray-600" aria-live="polite">
            {loading ? 'Loading classes...' : `${totalClasses} classes found`}
          </p>
        </div>
        <Button variant="gym" onClick={() => router.push('/admin/classes/new')}>
          <Plus className="h-4 w-4" />
          Create Class
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="flex flex-col gap-4 rounded-t-xl border-b border-gray-200 bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg text-gray-900">Filters</CardTitle>
          {(search || status !== 'all' || category !== 'all' || sort !== 'created_desc') && (
            <Button variant="link" className="h-auto px-0 text-sm" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            placeholder="Search classes..."
            ariaLabel="Search classes by name or description"
            onSearch={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            className="w-full lg:w-96"
            defaultValue={search}
          />
          <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
            <label htmlFor="class-status" className="sr-only">
              Filter classes by status
            </label>
            <Select value={status} onValueChange={(value) => setStatus(value as ClassStatusFilter)}>
              <SelectTrigger id="class-status" className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <label htmlFor="class-category" className="sr-only">
              Filter classes by category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="class-category" className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label htmlFor="class-sort" className="sr-only">
              Sort classes
            </label>
            <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
              <SelectTrigger id="class-sort" className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Newest first</SelectItem>
                <SelectItem value="created_asc">Oldest first</SelectItem>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="name_desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="classes-table">
        <h2 id="classes-table" className="sr-only">
          Classes list
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
              <Button variant="outline" onClick={fetchClasses}>
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : classes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">{emptyStateCopy}</p>
              {search || status !== 'all' || category !== 'all' ? (
                <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/admin/classes/new')}
                >
                  Create your first class
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <caption className="sr-only">Gym classes</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Class</TableHead>
                    <TableHead scope="col">Category</TableHead>
                    <TableHead scope="col">Duration</TableHead>
                    <TableHead scope="col">Capacity</TableHead>
                    <TableHead scope="col">Schedules</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col" className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((gymClass) => (
                    <TableRow key={gymClass.id}>
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <Dumbbell className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="flex flex-col">
                            <span>{gymClass.name}</span>
                            <span className="text-xs text-gray-500">
                              {gymClass.description || 'No description'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">{gymClass.category}</TableCell>
                      <TableCell className="text-gray-700">
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          {gymClass.duration} min
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          {gymClass.capacity}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700">{gymClass.schedules}</TableCell>
                      <TableCell>
                        <StatusBadge status={gymClass.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Open actions for ${gymClass.name}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/classes/${gymClass.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(gymClass.id)}
                              disabled={toggling === gymClass.id}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {gymClass.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(gymClass)}
                              className="text-red-600"
                              disabled={gymClass.schedules > 0}
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
                totalItems={totalClasses}
                itemsPerPage={20}
              />
            </>
          )}
        </div>
      </section>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Class"
        description={
          selectedClassHasSchedules
            ? `Cannot delete "${selectedClassName}" while it has scheduled sessions.`
            : `Are you sure you want to delete "${selectedClassName}"? This action cannot be undone.`
        }
        confirmLabel={selectedClassHasSchedules ? 'OK' : 'Delete'}
        variant={selectedClassHasSchedules ? 'default' : 'destructive'}
        onConfirm={selectedClassHasSchedules ? () => setDeleteDialogOpen(false) : handleDelete}
        isLoading={deleting}
      />
    </main>
  )
}
