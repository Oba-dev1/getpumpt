import { redirect } from 'next/navigation'

export default function MembershipPlansRedirectPage() {
  redirect('/admin/plans')
}
