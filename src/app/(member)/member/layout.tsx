import React from 'react';
import MemberHeader from '@/components/member/MemberHeader';
import MemberSidebar from '@/components/member/MemberSidebar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.gymId) {
    redirect('/login');
  }

  if (session.user.role !== 'MEMBER') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <MemberSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MemberHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
