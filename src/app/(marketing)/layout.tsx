import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GetPumpt | The #1 Gym Management Platform',
  description: 'All-in-one platform to manage memberships, classes, trainers, and payments. Beautiful branded websites included.',
  keywords: ['gym management', 'fitness software', 'membership management', 'class scheduling', 'gym software'],
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
