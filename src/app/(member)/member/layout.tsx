import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MemberShell from '@/components/member/MemberShell';

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
    <MemberShell>{children}</MemberShell>
  );
}
