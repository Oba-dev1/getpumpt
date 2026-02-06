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
  MoreVertical,
  Edit,
  Trash2,
  Power,
  Award,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getTrainers,
  deleteTrainer,
  toggleTrainerStatus,
} from '@/lib/actions/trainers'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type TrainerStatus = 'all' | 'ACTIVE' | 'INACTIVE'
type SortOption = 'created_desc' | 'created_asc' | 'name_asc' | 'name_desc'

export default function TrainersPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [trainers, setTrainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TrainerStatus>('all')
  const [sort, setSort] = useState<SortOption>('created_desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTrainers, setTotalTrainers] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null)
  const [selectedTrainerName, setSelectedTrainerName] = useState<string | null>(null)
  const [selectedTrainerHasSchedules, setSelectedTrainerHasSchedules] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const [sortBy, sortDir] = sort.split('_') as ['created' | 'name', 'asc' | 'desc']

  const fetchTrainers = async () => {
    if (!session?.user?.gymId) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const result = await getTrainers(session.user.gymId, {
        search: search || undefined,
        status: status === 'all' ? undefined : status,
        sortBy: sortBy === 'name' ? 'NAME' : 'CREATED',
        sortDir,
        page: currentPage,
        limit: 20,
      })

      setTrainers(result.trainers)
      setTotalPages(result.totalPages)
      setTotalTrainers(result.total)
    } catch (error) {
      setErrorMessage('Unable to load trainers right now.')
      toast.error('Failed to load trainers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrainers()
  }, [session, search, status, sort, currentPage])

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
    setSort('created_desc')
    setCurrentPage(1)
  }

  const openDeleteDialog = (trainer: any) => {
    setSelectedTrainerId(trainer.id)
    setSelectedTrainerName(`${trainer.firstName} ${trainer.lastName}`)
    setSelectedTrainerHasSchedules(trainer.schedules > 0)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!session?.user?.gymId || !selectedTrainerId) return

    setDeleting(true)
    try {
      await deleteTrainer(session.user.gymId, selectedTrainerId)
      toast.success('Trainer deleted successfully')
      await fetchTrainers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete trainer')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedTrainerId(null)
      setSelectedTrainerName(null)
      setSelectedTrainerHasSchedules(false)
    }
  }

  const handleToggleStatus = async (trainerId: string) => {
    if (!session?.user?.gymId) return

    setToggling(trainerId)
    try {
      await toggleTrainerStatus(session.user.gymId, trainerId)
      toast.success('Trainer status updated')
      await fetchTrainers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update trainer status')
    } finally {
      setToggling(null)
    }
  }

  const emptyStateCopy = useMemo(() => {
    if (search || status !== 'all') {
      return 'No trainers match your filters.'
    }
    return 'No trainers created yet.'
  }, [search, status])

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-4" aria-labelledby="trainers-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="trainers-title" className="text-2xl font-semibold tracking-tight text-gray-900">
            Trainers
          </h1>
          <p className="mt-1 text-sm text-gray-600" aria-live="polite">
            {loading ? 'Loading trainers...' : `${totalTrainers} trainers found`}
          </p>
        </div>
        <Button variant="gym" onClick={() => router.push('/admin/trainers/new')}>
          <Plus className="h-4 w-4" />
          Add Trainer
        </Button>
      </div>

      <Card className="border-gray-200 bg-slate-950/90">
        <CardHeader className="flex flex-col gap-3 rounded-t-xl border-b border-gray-200 bg-slate-900/90 py-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base text-gray-900">Filters</CardTitle>
          {(search || status !== 'all' || sort !== 'created_desc') && (
            <Button variant="link" className="h-auto px-0 text-sm" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            placeholder="Search by name or email..."
            ariaLabel="Search trainers by name or email"
            onSearch={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            className="w-full sm:w-96"
            defaultValue={search}
          />
          <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
            <Select value={status} onValueChange={(value) => setStatus(value as TrainerStatus)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
              <SelectTrigger className="w-full sm:w-44">
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

      <section aria-labelledby="trainers-table">
        <h2 id="trainers-table" className="sr-only">
          Trainers list
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
              <Button variant="outline" onClick={fetchTrainers}>
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : trainers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">{emptyStateCopy}</p>
              {(search || status !== 'all') ? (
                <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/admin/trainers/new')}
                >
                  Add your first trainer
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <caption className="sr-only">Trainer roster</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Trainer</TableHead>
                    <TableHead scope="col">Specialties</TableHead>
                    <TableHead scope="col">Experience</TableHead>
                    <TableHead scope="col">Schedules</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col" className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainers.map((trainer) => (
                    <TableRow key={trainer.id}>
                      <TableCell className="font-medium text-gray-900">
                        <Button
                          variant="link"
                          className="h-auto px-0 text-left text-gray-900"
                          onClick={() => router.push(`/admin/trainers/${trainer.id}`)}
                        >
                          <div className="flex flex-col">
                            <span>{trainer.firstName} {trainer.lastName}</span>
                            <span className="text-xs text-gray-500">{trainer.email}</span>
                          </div>
                        </Button>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {trainer.specialties.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {trainer.specialties.slice(0, 2).map((specialty: string) => (
                              <span
                                key={specialty}
                                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700"
                              >
                                <Award className="h-3 w-3" aria-hidden="true" />
                                {specialty}
                              </span>
                            ))}
                            {trainer.specialties.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{trainer.specialties.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No specialties</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {trainer.yearsExperience ? `${trainer.yearsExperience} yrs` : '—'}
                      </TableCell>
                      <TableCell className="text-gray-700">{trainer.schedules}</TableCell>
                      <TableCell>
                        <StatusBadge status={trainer.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Open actions for ${trainer.firstName} ${trainer.lastName}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/trainers/${trainer.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(trainer.id)}
                              disabled={toggling === trainer.id}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {trainer.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(trainer)}
                              className="text-red-600"
                              disabled={trainer.schedules > 0}
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
                totalItems={totalTrainers}
                itemsPerPage={20}
              />
            </>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Trainer"
        description={
          selectedTrainerHasSchedules
            ? `Cannot delete "${selectedTrainerName}" while they have scheduled classes.`
            : `Are you sure you want to delete "${selectedTrainerName}"? This action cannot be undone.`
        }
        confirmLabel={selectedTrainerHasSchedules ? 'OK' : 'Delete'}
        variant={selectedTrainerHasSchedules ? 'default' : 'destructive'}
        onConfirm={selectedTrainerHasSchedules ? () => setDeleteDialogOpen(false) : handleDelete}
        isLoading={deleting}
      />
    </main>
  )
}
