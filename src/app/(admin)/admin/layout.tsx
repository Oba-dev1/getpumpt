import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayoutClient from './layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
