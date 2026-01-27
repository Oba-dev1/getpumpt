'use client'
export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreVertical, Edit, Trash2, Star, Power } from 'lucide-react'
import {
  getMembershipPlans,
  deleteMembershipPlan,
  togglePlanStatus,
} from '@/lib/actions/plans'
import { toast } from 'sonner'

export default function PlansPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchPlans = async () => {
    if (!session?.user?.gymId) return

    setLoading(true)
    try {
      const result = await getMembershipPlans(session.user.gymId, true)
      setPlans(result)
    } catch (error) {
      console.error('Failed to fetch plans:', error)
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [session])

  const handleDelete = async () => {
    if (!session?.user?.gymId || !selectedPlanId) return

    setDeleting(true)
    try {
      await deleteMembershipPlan(session.user.gymId, selectedPlanId)
      toast.success('Plan deleted successfully')
      await fetchPlans()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete plan')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedPlanId(null)
    }
  }

  const handleToggleStatus = async (planId: string) => {
    if (!session?.user?.gymId) return

    setToggling(planId)
    try {
      await togglePlanStatus(session.user.gymId, planId)
      toast.success('Plan status updated')
      await fetchPlans()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update plan status')
    } finally {
      setToggling(null)
    }
  }

  const openDeleteDialog = (planId: string) => {
    setSelectedPlanId(planId)
    setDeleteDialogOpen(true)
  }

  if (!session?.user?.gymId) {
    return null
  }

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Membership Plans
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage subscription plans and pricing
          </p>
        </div>
        <Button onClick={() => router.push('/admin/plans/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-500">No membership plans yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/admin/plans/new')}
            >
              Create your first plan
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={
                plan.isFeatured
                  ? 'relative border-2 border-indigo-500'
                  : 'relative'
              }
            >
              {plan.isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-indigo-600">
                    <Star className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    {plan.description && (
                      <CardDescription className="mt-2">
                        {plan.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/plans/${plan.id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(plan.id)}
                        disabled={toggling === plan.id}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {plan.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(plan.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.currency} {Number(plan.price).toLocaleString()}
                    </span>
                    <span className="text-gray-500">/ {plan.billingCycle}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Duration: {plan.durationValue} {plan.durationType}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <StatusBadge
                      status={plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Subscribers
                    </p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {plan._count?.memberships || 0}
                    </p>
                  </div>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Features:
                    </p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((feature: string, i: number) => (
                        <li key={i} className="flex items-start text-sm text-gray-600">
                          <span className="mr-2 text-indigo-600">✓</span>
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-sm text-gray-500">
                          +{plan.features.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {plan.classCredits && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-sm font-medium text-gray-700">
                      {plan.classCredits} class credits per {plan.billingCycle}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Plan"
        description={
          selectedPlan?._count?.memberships > 0
            ? `Cannot delete "${selectedPlan.name}" because ${selectedPlan._count.memberships} member(s) are currently subscribed to this plan.`
            : `Are you sure you want to delete "${selectedPlan?.name}"? This action cannot be undone.`
        }
        confirmLabel={selectedPlan?._count?.memberships > 0 ? 'OK' : 'Delete'}
        variant={selectedPlan?._count?.memberships > 0 ? 'default' : 'destructive'}
        onConfirm={
          selectedPlan?._count?.memberships > 0
            ? () => setDeleteDialogOpen(false)
            : handleDelete
        }
        isLoading={deleting}
      />
    </div>
  )
}
