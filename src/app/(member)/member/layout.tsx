import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MemberShell from '@/components/member/MemberShell';
import { EmailVerificationBanner } from '@/components/member/EmailVerificationBanner';

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

  const memberUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, email: true },
  });

  return (
    <>
      {!memberUser?.emailVerified && memberUser?.email && (
        <EmailVerificationBanner email={memberUser.email} />
      )}
      <MemberShell>{children}</MemberShell>
    </>
  );
}
