'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { getMemberById, updateMember } from '@/lib/actions/members'
import { toast } from 'sonner'

const editMemberSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
})

type EditMemberFormData = z.infer<typeof editMemberSchema>

export default function EditMemberPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const memberId = params.id as string

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditMemberFormData>({
    resolver: zodResolver(editMemberSchema),
  })

  const status = watch('status')

  useEffect(() => {
    async function fetchMember() {
      if (!session?.user?.gymId || !memberId) return

      setLoading(true)
      try {
        const member = await getMemberById(session.user.gymId, memberId)
        reset({
          firstName: member.firstName,
          lastName: member.lastName,
          phone: member.phone || '',
          status: member.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
        })
      } catch (error: any) {
        toast.error(error.message || 'Failed to load member')
        router.push('/admin/members')
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [session, memberId, reset, router])

  const onSubmit = async (data: EditMemberFormData) => {
    if (!session?.user?.gymId || !memberId) return

    setSaving(true)
    try {
      await updateMember(session.user.gymId, memberId, {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim() || undefined,
        status: data.status,
      })
      toast.success('Member updated successfully')
      router.push(`/admin/members/${memberId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update member')
    } finally {
      setSaving(false)
    }
  }

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-4" aria-labelledby="edit-member-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/admin/members/${memberId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to member
          </Button>
          <h1
            id="edit-member-title"
            className="mt-3 text-2xl font-semibold tracking-tight text-gray-900"
          >
            Edit Member
          </h1>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <CardTitle className="text-lg text-gray-900">Member details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" type="tel" {...register('phone')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setValue('status', value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/members/${memberId}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
