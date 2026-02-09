'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { createStaff } from '@/lib/actions/staff'
import { createStaffSchema, type CreateStaffInput } from '@/lib/validations'
import { toast } from 'sonner'

export default function NewStaffPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      role: 'STAFF',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: CreateStaffInput) => {
    if (!session?.user?.gymId) return

    setLoading(true)
    try {
      await createStaff(session.user.gymId, data)
      toast.success('Staff member created successfully')
      router.push('/admin/staff')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create staff member')
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/staff')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
          Add New Staff Member
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="+234 800 000 0000"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role & Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) =>
                      setValue('role', value as 'STAFF' | 'ADMIN')
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Admin</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600">{errors.role.message}</p>
                  )}
                  <div className="rounded-lg bg-slate-900/50 border border-white/10 p-3 text-sm">
                    {selectedRole === 'ADMIN' ? (
                      <div>
                        <p className="font-medium text-gray-200">Admin Access</p>
                        <p className="mt-1 text-gray-400">
                          Full access to the admin portal, including member management,
                          settings, and reports.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-200">Staff Access</p>
                        <p className="mt-1 text-gray-400">
                          Can register members, check in customers, manage classes and schedules,
                          view plans and payments.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <PasswordInput
                    id="password"
                    {...register('password')}
                    placeholder="Min. 8 characters"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Must contain at least 8 characters, including uppercase, lowercase, and numbers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/staff')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="gym" disabled={loading}>
            {loading ? 'Creating...' : 'Create Staff Member'}
          </Button>
        </div>
      </form>
    </div>
  )
}
