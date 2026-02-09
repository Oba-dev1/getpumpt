import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayoutClient from './layout-client'
import { isGymOnboardingComplete } from '@/lib/onboarding-guard'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const isComplete = await isGymOnboardingComplete(session.user.gymId)
  if (!isComplete) {
    redirect('/onboarding/welcome')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
