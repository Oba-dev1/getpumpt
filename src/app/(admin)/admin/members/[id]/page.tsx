'use client'
export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { getMemberById, deleteMember } from '@/lib/actions/members'
import { toast } from 'sonner'

export default function MemberDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const memberId = params.id as string

  useEffect(() => {
    async function fetchMember() {
      if (!session?.user?.gymId || !memberId) return

      setLoading(true)
      try {
        const result = await getMemberById(session.user.gymId, memberId)
        setMember(result)
      } catch (error) {
        console.error('Failed to fetch member:', error)
        toast.error('Failed to load member details')
        router.push('/admin/members')
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [session, memberId, router])

  const handleDelete = async () => {
    if (!session?.user?.gymId) return

    setDeleting(true)
    try {
      await deleteMember(session.user.gymId, memberId)
      toast.success('Member deleted successfully')
      router.push('/admin/members')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete member')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
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

  if (!member) {
    return null
  }

  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/members')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
            Member Profile
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/members/${memberId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">
                {member.firstName} {member.lastName}
              </h2>
              <StatusBadge status={member.status} />
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{member.email}</p>
                </div>
              </div>

              {member.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{member.phone}</p>
                  </div>
                </div>
              )}

              {member.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">{member.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Joined</p>
                  <p className="text-sm text-gray-900">
                    {new Date(member.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {member.dateOfBirth && (
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Date of Birth
                    </p>
                    <p className="text-sm text-gray-900">
                      {new Date(member.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {member.gender && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-sm text-gray-900">{member.gender}</p>
                </div>
              )}
            </div>

            {(member.emergencyContact || member.emergencyPhone) && (
              <div className="border-t pt-4">
                <h3 className="mb-3 font-semibold text-gray-900">
                  Emergency Contact
                </h3>
                {member.emergencyContact && (
                  <p className="text-sm text-gray-900">
                    {member.emergencyContact}
                  </p>
                )}
                {member.emergencyPhone && (
                  <p className="text-sm text-gray-500">{member.emergencyPhone}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Current Membership</CardTitle>
              <Button
                size="sm"
                onClick={() =>
                  router.push(`/admin/members/${memberId}/assign-plan`)
                }
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Plan
              </Button>
            </CardHeader>
            <CardContent>
              {member.membership ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Plan</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {member.membership.plan.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <StatusBadge status={member.membership.status} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Start Date
                      </p>
                      <p className="text-sm text-gray-900">
                        {new Date(
                          member.membership.startDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        End Date
                      </p>
                      <p className="text-sm text-gray-900">
                        {new Date(member.membership.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No active membership. Assign a plan to get started.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {member.payments && member.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.payments.slice(0, 5).map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.currency} {Number(payment.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {payment.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No payments yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {member.bookings && member.bookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.bookings.slice(0, 5).map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(booking.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {booking.className || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No bookings yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Member"
        description={`Are you sure you want to delete ${member.firstName} ${member.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  )
}
