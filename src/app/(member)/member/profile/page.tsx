import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils'
import { getMemberProfile, updateMemberProfile } from '@/lib/actions/member-portal'
import { MemberActionForm } from '@/components/member/MemberActionForm'
import { MemberActionProvider } from '@/components/member/MemberActionContext'
import { MemberActionButton } from '@/components/member/MemberActionButton'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const profile = await getMemberProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <main className="member-stack" aria-labelledby="member-profile-title">
      <header>
        <h1
          id="member-profile-title"
          className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Keep your details up to date so we can reach you quickly.
        </p>
      </header>

      <MemberActionProvider>
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="member-card lg:col-span-2">
            <CardHeader className="member-card-header">
              <CardTitle className="text-base text-white">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="member-card-content">
              <MemberActionForm action={updateMemberProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-200">
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={profile.firstName}
                      className="border-white/10 bg-slate-900 text-slate-100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-200">
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={profile.lastName}
                      className="border-white/10 bg-slate-900 text-slate-100"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      defaultValue={profile.email ?? undefined}
                      className="border-white/10 bg-slate-900 text-slate-400"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-200">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={profile.phone ?? ''}
                      placeholder="Add a phone number"
                      className="border-white/10 bg-slate-900 text-slate-100"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MemberActionButton variant="gym" className="h-9 px-4 text-sm" pendingText="Saving...">
                    Save changes
                  </MemberActionButton>
                  <p className="text-xs text-slate-400">
                    Last updated {formatDate(profile.updatedAt)}
                  </p>
                </div>
              </MemberActionForm>
            </CardContent>
          </Card>

          <Card className="member-card">
            <CardHeader className="member-card-header">
              <CardTitle className="text-base text-white">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="member-card-content space-y-3">
              <div className="text-sm text-slate-300">
                <p className="text-xs text-slate-400">Status</p>
                <p className="text-sm text-slate-100">{profile.status}</p>
              </div>
              <div className="text-sm text-slate-300">
                <p className="text-xs text-slate-400">Member since</p>
                <p className="text-sm text-slate-100">{formatDate(profile.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </MemberActionProvider>
    </main>
  )
}
