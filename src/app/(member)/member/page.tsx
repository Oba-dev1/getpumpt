import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, CreditCard, Dumbbell, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MemberDashboard() {
  const session = await auth();

  if (!session?.user?.gymId) {
    redirect('/login');
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome back, {session.user.name?.split(' ')[0]}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your membership
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="gym" asChild>
            <Link href="/member/classes">
              <Calendar className="mr-2 h-4 w-4" />
              Book a Class
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-indigo-100 hover:border-indigo-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <User className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Manage your personal information</p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/member/profile">View Profile →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">View your membership details</p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/member/membership">View Membership →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <Dumbbell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Browse and book gym classes</p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/member/classes">Browse Classes →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-100 hover:border-amber-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">View your booked classes</p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/member/bookings">My Bookings →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Welcome to your member portal! Here you can:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2 text-indigo-600">✓</span>
              Update your profile and emergency contact information
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-indigo-600">✓</span>
              View your membership status and renewal dates
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-indigo-600">✓</span>
              Book and manage your class reservations
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-indigo-600">✓</span>
              View your payment history and make payments online
            </li>
          </ul>
          <div className="pt-4">
            <Button variant="gym" asChild>
              <Link href="/member/profile">Complete Your Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
