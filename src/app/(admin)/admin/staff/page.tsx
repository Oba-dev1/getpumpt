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
import { Badge } from '@/components/ui/badge'
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
  Eye,
  RefreshCcw,
  X,
  MoreVertical,
  Trash2,
  ShieldCheck,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { getStaff, deleteStaff, updateStaffRole } from '@/lib/actions/staff'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

type RoleFilter = 'all' | 'STAFF' | 'ADMIN'
type StatusFilter = 'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
type SortOption =
  | 'joined_desc' | 'joined_asc'
  | 'name_asc' | 'name_desc'
  | 'role_asc' | 'role_desc'
  | 'status_asc' | 'status_desc'

export default function StaffPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<SortOption>('joined_desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalStaff, setTotalStaff] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [selectedStaffName, setSelectedStaffName] = useState<string | null>(null)
  const [selectedStaffRole, setSelectedStaffRole] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<'STAFF' | 'ADMIN'>('STAFF')
  const [deleting, setDeleting] = useState(false)
  const [updatingRole, setUpdatingRole] = useState(false)

  const [sortBy, sortDir] = sort.split('_') as [string, 'asc' | 'desc']

  const fetchStaff = async () => {
    if (!session?.user?.gymId) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const result = await getStaff(session.user.gymId, {
        search: search || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: status === 'all' ? undefined : status,
        sortBy: sortBy.toUpperCase() as 'NAME' | 'JOINED' | 'ROLE' | 'STATUS',
        sortDir,
        page: currentPage,
        limit: 20,
      })

      setStaff(result.staff)
      setTotalPages(result.totalPages)
      setTotalStaff(result.total)
    } catch {
      setErrorMessage('Unable to load staff right now.')
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, search, roleFilter, status, sort, currentPage])

  const handleSearch = (query: string) => {
    setSearch(query)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setRoleFilter('all')
    setStatus('all')
    setSort('joined_desc')
    setCurrentPage(1)
  }

  const openDeleteDialog = (staffMember: any) => {
    setSelectedStaffId(staffMember.id)
    setSelectedStaffName(`${staffMember.firstName} ${staffMember.lastName}`)
    setDeleteDialogOpen(true)
  }

  const openRoleDialog = (staffMember: any) => {
    setSelectedStaffId(staffMember.id)
    setSelectedStaffName(`${staffMember.firstName} ${staffMember.lastName}`)
    setSelectedStaffRole(staffMember.role)
    setNewRole(staffMember.role === 'STAFF' ? 'ADMIN' : 'STAFF')
    setRoleDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!session?.user?.gymId || !selectedStaffId || !session?.user?.id) return

    setDeleting(true)
    try {
      await deleteStaff(session.user.gymId, selectedStaffId, session.user.id)
      toast.success('Staff member removed successfully')
      await fetchStaff()
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove staff member')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedStaffId(null)
      setSelectedStaffName(null)
    }
  }

  const handleRoleChange = async () => {
    if (!session?.user?.gymId || !selectedStaffId || !session?.user?.id) return

    setUpdatingRole(true)
    try {
      await updateStaffRole(
        session.user.gymId,
        selectedStaffId,
        session.user.id,
        { role: newRole }
      )
      toast.success('Role updated successfully')
      await fetchStaff()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role')
    } finally {
      setUpdatingRole(false)
      setRoleDialogOpen(false)
      setSelectedStaffId(null)
      setSelectedStaffName(null)
      setSelectedStaffRole(null)
    }
  }

  const getRoleBadge = (role: string) => {
    return role === 'ADMIN' ? (
      <Badge variant="default" className="gap-1">
        <ShieldCheck className="h-3 w-3" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary">Staff</Badge>
    )
  }

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  const isCurrentUser = (staffId: string) => staffId === session?.user?.id
  const hasActiveFilters = search || roleFilter !== 'all' || status !== 'all' || sort !== 'joined_desc'

  return (
    <main className="space-y-4" aria-labelledby="staff-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="staff-title" className="text-2xl font-semibold tracking-tight text-gray-900">
            Staff
          </h1>
          <p className="mt-1 text-sm text-gray-600" aria-live="polite">
            {loading ? 'Loading staff...' : `${totalStaff} staff member${totalStaff !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Button variant="gym" onClick={() => router.push('/admin/staff/new')}>
          <UserPlus className="h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      <Card className="border-gray-200 bg-slate-950/90">
        <CardHeader className="flex flex-col gap-3 rounded-t-xl border-b border-gray-200 bg-slate-900/90 py-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base text-gray-900">Filters</CardTitle>
          {hasActiveFilters && (
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
            ariaLabel="Search staff by name or email"
            defaultValue={search}
          />
          <div className="flex w-full flex-wrap items-center gap-2.5 lg:w-auto">
            <label htmlFor="staff-role" className="sr-only">Filter staff by role</label>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v as RoleFilter); setCurrentPage(1) }}>
              <SelectTrigger id="staff-role" className="w-full sm:w-44">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
            <label htmlFor="staff-status" className="sr-only">Filter staff by status</label>
            <Select value={status} onValueChange={(v) => { setStatus(v as StatusFilter); setCurrentPage(1) }}>
              <SelectTrigger id="staff-status" className="w-full sm:w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <label htmlFor="staff-sort" className="sr-only">Sort staff</label>
            <Select value={sort} onValueChange={(v) => { setSort(v as SortOption); setCurrentPage(1) }}>
              <SelectTrigger id="staff-sort" className="w-full sm:w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="joined_desc">Newest first</SelectItem>
                <SelectItem value="joined_asc">Oldest first</SelectItem>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="name_desc">Name Z-A</SelectItem>
                <SelectItem value="role_asc">Role A-Z</SelectItem>
                <SelectItem value="role_desc">Role Z-A</SelectItem>
                <SelectItem value="status_asc">Status A-Z</SelectItem>
                <SelectItem value="status_desc">Status Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="staff-table">
        <h2 id="staff-table" className="sr-only">Staff list</h2>
        <div className="rounded-lg border border-gray-200 bg-slate-950/90">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
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
              <Button variant="outline" onClick={fetchStaff}>
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : staff.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No staff members found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/admin/staff/new')}
              >
                Add your first staff member
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <caption className="sr-only">Staff records</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Staff Member</TableHead>
                    <TableHead scope="col">Email</TableHead>
                    <TableHead scope="col">Phone</TableHead>
                    <TableHead scope="col">Role</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Joined</TableHead>
                    <TableHead scope="col" className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((staffMember) => {
                    const isSelf = isCurrentUser(staffMember.id)
                    return (
                      <TableRow key={staffMember.id}>
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              {staffMember.avatar ? (
                                <AvatarImage src={staffMember.avatar} alt="" />
                              ) : null}
                              <AvatarFallback>
                                {staffMember.firstName?.[0]}
                                {staffMember.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2">
                              <span>{staffMember.firstName} {staffMember.lastName}</span>
                              {isSelf && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">{staffMember.email}</TableCell>
                        <TableCell className="text-gray-600">
                          {staffMember.phone || '-'}
                        </TableCell>
                        <TableCell>{getRoleBadge(staffMember.role)}</TableCell>
                        <TableCell>
                          <StatusBadge status={staffMember.status} />
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(staffMember.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Open actions for ${staffMember.firstName} ${staffMember.lastName}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/admin/staff/${staffMember.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openRoleDialog(staffMember)}
                                disabled={isSelf}
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Change role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(staffMember)}
                                className="text-red-600"
                                disabled={isSelf}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalStaff}
                itemsPerPage={20}
              />
            </>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove Staff Member"
        description={`Are you sure you want to remove "${selectedStaffName}" from your staff? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />

      <ConfirmDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        title="Change Staff Role"
        description={`Change "${selectedStaffName}" from ${selectedStaffRole} to ${newRole}?`}
        confirmLabel="Change Role"
        variant="default"
        onConfirm={handleRoleChange}
        isLoading={updatingRole}
      />
    </main>
  )
}
