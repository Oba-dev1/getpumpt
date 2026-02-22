'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchInput } from '@/components/admin/SearchInput'
import { Pagination } from '@/components/admin/Pagination'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  UserPlus,
  Upload,
  Eye,
  RefreshCcw,
  X,
  MoreVertical,
  Trash2,
} from 'lucide-react'
import { MemberImportDialog } from '@/components/admin/MemberImportDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getMembers, deleteMember } from '@/lib/actions/members'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export default function MembersPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('all')
  const [sort, setSort] = useState<
    'joined_desc' | 'joined_asc' | 'name_asc' | 'name_desc' | 'status_asc' | 'status_desc'
  >('joined_desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalMembers, setTotalMembers] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null)
  const [selectedMemberActive, setSelectedMemberActive] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const [sortBy, sortDir] = sort.split('_') as ['joined' | 'name' | 'status', 'asc' | 'desc']

  const fetchMembers = async () => {
    if (!session?.user?.gymId) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const result = await getMembers(session.user.gymId, {
        search: search || undefined,
        status: status === 'all' ? undefined : status,
        sortBy: sortBy.toUpperCase() as 'NAME' | 'JOINED' | 'STATUS',
        sortDir,
        page: currentPage,
        limit: 20,
      })

      setMembers(result.members)
      setTotalPages(result.totalPages)
      setTotalMembers(result.total)
    } catch (error) {
      setErrorMessage('Unable to load members right now.')
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [session, search, status, sort, currentPage])

  const handleSearch = (query: string) => {
    setSearch(query)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: 'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    setStatus(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: typeof sort) => {
    setSort(value)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
    setSort('joined_desc')
    setCurrentPage(1)
  }

  const openDeleteDialog = (member: any) => {
    setSelectedMemberId(member.id)
    setSelectedMemberName(`${member.firstName} ${member.lastName}`)
    setSelectedMemberActive(member.membership?.status === 'ACTIVE')
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!session?.user?.gymId || !selectedMemberId) return

    setDeleting(true)
    try {
      await deleteMember(session.user.gymId, selectedMemberId)
      toast.success('Member deleted successfully')
      await fetchMembers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete member')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedMemberId(null)
      setSelectedMemberName(null)
      setSelectedMemberActive(false)
    }
  }

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-4" aria-labelledby="members-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="members-title" className="text-2xl font-semibold tracking-tight text-gray-900">
            Members
          </h1>
          <p className="mt-1 text-sm text-gray-600" aria-live="polite">
            {loading ? 'Loading members...' : `${totalMembers} members found`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="gym" onClick={() => router.push('/admin/members/new')}>
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      <Card className="border-gray-200 bg-slate-950/90">
        <CardHeader className="flex flex-col gap-3 rounded-t-xl border-b border-gray-200 bg-slate-900/90 py-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base text-gray-900">Filters</CardTitle>
          {(search || status !== 'all' || sort !== 'joined_desc') && (
            <Button variant="link" className="h-auto px-0 text-sm" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            placeholder="Search by name or email..."
            onSearch={handleSearch}
            className="w-full sm:w-96"
            ariaLabel="Search members by name or email"
            defaultValue={search}
          />
          <div className="flex w-full flex-wrap items-center gap-2.5 lg:w-auto">
            <label htmlFor="member-status" className="sr-only">
              Filter members by status
            </label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger id="member-status" className="w-full sm:w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <label htmlFor="member-sort" className="sr-only">
              Sort members
            </label>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger id="member-sort" className="w-full sm:w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="joined_desc">Newest first</SelectItem>
                <SelectItem value="joined_asc">Oldest first</SelectItem>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="name_desc">Name Z-A</SelectItem>
                <SelectItem value="status_asc">Status A-Z</SelectItem>
                <SelectItem value="status_desc">Status Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="members-table">
        <h2 id="members-table" className="sr-only">
          Members list
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
              <Button variant="outline" onClick={fetchMembers}>
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No members found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/admin/members/new')}
              >
                Add your first member
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <caption className="sr-only">Member records</caption>
                <TableHeader>
                  <TableRow>
                      <TableHead scope="col">Member</TableHead>
                    <TableHead scope="col">Email</TableHead>
                    <TableHead scope="col">Phone</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Plan</TableHead>
                    <TableHead scope="col">Joined</TableHead>
                      <TableHead scope="col" className="text-right">
                        Actions
                      </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {member.avatar ? (
                              <AvatarImage src={member.avatar} alt="" />
                            ) : null}
                            <AvatarFallback>
                              {member.firstName?.[0]}
                              {member.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.firstName} {member.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">{member.email}</TableCell>
                      <TableCell className="text-gray-600">
                        {member.phone || '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={member.status} />
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {member.membership?.plan || (
                          <span className="text-gray-500">No plan</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Open actions for ${member.firstName} ${member.lastName}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/members/${member.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(member)}
                              className="text-red-600"
                              disabled={member.membership?.status === 'ACTIVE'}
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
                totalItems={totalMembers}
                itemsPerPage={20}
              />
            </>
          )}
        </div>
      </section>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Member"
        description={
          selectedMemberActive
            ? `Cannot delete "${selectedMemberName}" while they have an active membership.`
            : `Are you sure you want to delete "${selectedMemberName}"? This action cannot be undone.`
        }
        confirmLabel={selectedMemberActive ? 'OK' : 'Delete'}
        variant={selectedMemberActive ? 'default' : 'destructive'}
        onConfirm={selectedMemberActive ? () => setDeleteDialogOpen(false) : handleDelete}
        isLoading={deleting}
      />

      {session?.user?.gymId && (
        <MemberImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          gymId={session.user.gymId}
          onImportComplete={fetchMembers}
        />
      )}
    </main>
  )
}
