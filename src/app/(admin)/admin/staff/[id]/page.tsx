'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Trash2,
  ShieldCheck,
} from 'lucide-react'
import { getStaffById, deleteStaff, updateStaffRole } from '@/lib/actions/staff'
import { toast } from 'sonner'

export default function StaffDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const [staff, setStaff] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState<'STAFF' | 'ADMIN'>('STAFF')
  const [updatingRole, setUpdatingRole] = useState(false)

  const staffId = params.id as string

  useEffect(() => {
    async function fetchStaff() {
      if (!session?.user?.gymId || !staffId) return

      setLoading(true)
      try {
        const result = await getStaffById(session.user.gymId, staffId)
        setStaff(result)
        setNewRole(result.role === 'STAFF' ? 'ADMIN' : 'STAFF')
      } catch {
        toast.error('Failed to load staff member details')
        router.push('/admin/staff')
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, staffId])

  const handleDelete = async () => {
    if (!session?.user?.gymId || !session?.user?.id) return

    setDeleting(true)
    try {
      await deleteStaff(session.user.gymId, staffId, session.user.id)
      toast.success('Staff member removed successfully')
      router.push('/admin/staff')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove staff member')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleRoleChange = async () => {
    if (!session?.user?.gymId || !session?.user?.id) return

    setUpdatingRole(true)
    try {
      await updateStaffRole(session.user.gymId, staffId, session.user.id, {
        role: newRole,
      })
      toast.success('Role updated successfully')
      const updated = await getStaffById(session.user.gymId, staffId)
      setStaff(updated)
      setNewRole(updated.role === 'STAFF' ? 'ADMIN' : 'STAFF')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role')
    } finally {
      setUpdatingRole(false)
      setRoleDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    )
  }

  if (!staff) {
    return null
  }

  const initials = `${staff.firstName[0]}${staff.lastName[0]}`.toUpperCase()
  const isSelf = staff.id === session?.user?.id

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/staff')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {staff.firstName} {staff.lastName}
            </h1>
            <p className="text-sm text-gray-600">Staff member details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setRoleDialogOpen(true)}
            disabled={isSelf}
          >
            <ShieldCheck className="h-4 w-4" />
            Change Role
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isSelf}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                {staff.avatar ? (
                  <AvatarImage src={staff.avatar} alt="" />
                ) : null}
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {staff.firstName} {staff.lastName}
                </h2>
                {isSelf && (
                  <Badge variant="outline" className="mt-2">You</Badge>
                )}
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{staff.email}</span>
              </div>
              {staff.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{staff.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">
                  Joined {new Date(staff.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <div className="mt-1">
                  {staff.role === 'ADMIN' ? (
                    <Badge variant="default" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Staff</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {staff.role === 'ADMIN'
                    ? 'Full access to admin portal'
                    : 'Can register members, check in customers, manage classes and schedules'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1">
                  <StatusBadge status={staff.status} />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(staff.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(staff.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {isSelf && (
              <div className="rounded-lg bg-blue-950/30 border border-blue-500/20 p-4 text-sm text-blue-300">
                This is your account. You cannot change your own role or remove your account from this page.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove Staff Member"
        description={`Are you sure you want to remove ${staff.firstName} ${staff.lastName} from your staff? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />

      <ConfirmDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        title="Change Staff Role"
        description={`Change ${staff.firstName} ${staff.lastName} from ${staff.role} to ${newRole}?`}
        confirmLabel="Change Role"
        variant="default"
        onConfirm={handleRoleChange}
        isLoading={updatingRole}
      />
    </main>
  )
}
