'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { getGymSettings, updateGymSettings } from '@/lib/actions/settings'
import { CustomDomainCard } from '@/components/admin/CustomDomainCard'

const settingsSchema = z.object({
  name: z.string().min(2, 'Gym name is required'),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Valid email is required').optional(),
  website: z.string().url('Valid URL is required').optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroCtaLabel: z.string().optional(),
  aboutHeadline: z.string().optional(),
  aboutBody: z.string().optional(),
  featuresList: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  emailWelcome: z.string().optional(),
  emailRenewal: z.string().optional(),
  emailReceipt: z.string().optional(),
  emailCancellation: z.string().optional(),
  membershipGracePeriod: z.string(),
  autoRenewDefault: z.boolean(),
  cancellationPolicyHours: z.string(),
  maxAdvanceBookingDays: z.string(),
  waitlistEnabled: z.boolean(),
  paymentReminderDays: z.string(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      autoRenewDefault: true,
      waitlistEnabled: true,
      membershipGracePeriod: '7',
      cancellationPolicyHours: '12',
      maxAdvanceBookingDays: '14',
      paymentReminderDays: '3',
    },
  })

  const autoRenewDefault = watch('autoRenewDefault')
  const waitlistEnabled = watch('waitlistEnabled')

  useEffect(() => {
    async function fetchSettings() {
      if (!session?.user?.gymId) return

      setLoading(true)
      try {
        const settings = await getGymSettings(session.user.gymId)
        const hero = settings.heroContent as Record<string, string> | null
        const about = settings.aboutContent as Record<string, string> | null
        reset({
          name: settings.name,
          logo: settings.logo,
          favicon: settings.favicon,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          address: settings.address,
          city: settings.city,
          state: settings.state,
          country: settings.country,
          phone: settings.phone,
          email: settings.email,
          website: settings.website,
          heroTitle: hero?.title ?? '',
          heroSubtitle: hero?.subtitle ?? '',
          heroCtaLabel: hero?.ctaLabel ?? '',
          aboutHeadline: about?.headline ?? '',
          aboutBody: about?.body ?? '',
          featuresList: (settings.features ?? []).join(', '),
          metaTitle: settings.metaTitle ?? '',
          metaDescription: settings.metaDescription ?? '',
          emailWelcome: settings.emailTemplates?.welcome ?? '',
          emailRenewal: settings.emailTemplates?.renewalReminder ?? '',
          emailReceipt: settings.emailTemplates?.paymentReceipt ?? '',
          emailCancellation: settings.emailTemplates?.cancellation ?? '',
          membershipGracePeriod: String(settings.settings.membershipGracePeriod ?? 7),
          autoRenewDefault: settings.settings.autoRenewDefault ?? true,
          cancellationPolicyHours: String(settings.settings.cancellationPolicyHours ?? 12),
          maxAdvanceBookingDays: String(settings.settings.maxAdvanceBookingDays ?? 14),
          waitlistEnabled: settings.settings.waitlistEnabled ?? true,
          paymentReminderDays: String(settings.settings.paymentReminderDays ?? 3),
        })
      } catch (error: any) {
        toast.error(error.message || 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [session, reset])

  const onSubmit = async (data: SettingsFormData) => {
    if (!session?.user?.gymId) return

    setSaving(true)
    try {
      await updateGymSettings(session.user.gymId, {
        name: data.name.trim(),
        logo: data.logo?.trim() || '',
        favicon: data.favicon?.trim() || '',
        primaryColor: data.primaryColor?.trim() || '',
        secondaryColor: data.secondaryColor?.trim() || '',
        address: data.address?.trim() || '',
        city: data.city?.trim() || '',
        state: data.state?.trim() || '',
        country: data.country?.trim() || '',
        phone: data.phone?.trim() || '',
        email: data.email?.trim() || '',
        website: data.website?.trim() || '',
        heroContent: {
          title: data.heroTitle?.trim() || '',
          subtitle: data.heroSubtitle?.trim() || '',
          ctaLabel: data.heroCtaLabel?.trim() || '',
        },
        aboutContent: {
          headline: data.aboutHeadline?.trim() || '',
          body: data.aboutBody?.trim() || '',
        },
        features: data.featuresList
          ? data.featuresList.split(',').map((feature) => feature.trim()).filter(Boolean)
          : [],
        metaTitle: data.metaTitle?.trim() || '',
        metaDescription: data.metaDescription?.trim() || '',
        emailTemplates: {
          welcome: data.emailWelcome?.trim() || '',
          renewalReminder: data.emailRenewal?.trim() || '',
          paymentReceipt: data.emailReceipt?.trim() || '',
          cancellation: data.emailCancellation?.trim() || '',
        },
        settings: {
          membershipGracePeriod: Number(data.membershipGracePeriod),
          autoRenewDefault: data.autoRenewDefault,
          cancellationPolicyHours: Number(data.cancellationPolicyHours),
          maxAdvanceBookingDays: Number(data.maxAdvanceBookingDays),
          waitlistEnabled: data.waitlistEnabled,
          paymentReminderDays: Number(data.paymentReminderDays),
        },
      })
      toast.success('Settings saved')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-4" aria-labelledby="settings-title">
      <div>
        <h1 id="settings-title" className="text-2xl font-semibold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure your gym profile, branding, and operational defaults.
        </p>
      </div>

      {session?.user?.gymId && (
        <CustomDomainCard gymId={session.user.gymId} />
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-gray-200">
            <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
              <CardTitle className="text-lg text-gray-900">Business info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 pt-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Gym name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://..." {...register('website')} />
                {errors.website && (
                  <p className="text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register('address')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register('state')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register('country')} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
              <CardTitle className="text-lg text-gray-900">Branding</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input id="logo" placeholder="https://..." {...register('logo')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input id="favicon" placeholder="https://..." {...register('favicon')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary color</Label>
                <Input id="primaryColor" type="color" {...register('primaryColor')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary color</Label>
                <Input id="secondaryColor" type="color" {...register('secondaryColor')} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
              <CardTitle className="text-lg text-gray-900">Website configuration</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 pt-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="heroTitle">Hero title</Label>
                <Input id="heroTitle" {...register('heroTitle')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="heroSubtitle">Hero subtitle</Label>
                <Textarea id="heroSubtitle" rows={3} {...register('heroSubtitle')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroCtaLabel">Hero CTA label</Label>
                <Input id="heroCtaLabel" {...register('heroCtaLabel')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="aboutHeadline">About headline</Label>
                <Input id="aboutHeadline" {...register('aboutHeadline')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="aboutBody">About body</Label>
                <Textarea id="aboutBody" rows={4} {...register('aboutBody')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="featuresList">Feature highlights (comma-separated)</Label>
                <Input id="featuresList" placeholder="24/7 access, Sauna, Group classes" {...register('featuresList')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaTitle">SEO title</Label>
                <Input id="metaTitle" {...register('metaTitle')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">SEO description</Label>
                <Textarea id="metaDescription" rows={3} {...register('metaDescription')} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
              <CardTitle className="text-lg text-gray-900">Email templates</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 pt-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emailWelcome">Welcome email</Label>
                <Textarea id="emailWelcome" rows={4} {...register('emailWelcome')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emailRenewal">Renewal reminder</Label>
                <Textarea id="emailRenewal" rows={4} {...register('emailRenewal')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emailReceipt">Payment receipt</Label>
                <Textarea id="emailReceipt" rows={4} {...register('emailReceipt')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emailCancellation">Cancellation confirmation</Label>
                <Textarea id="emailCancellation" rows={4} {...register('emailCancellation')} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
              <CardTitle className="text-lg text-gray-900">Operational settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="membershipGracePeriod">Membership grace period (days)</Label>
                <Input id="membershipGracePeriod" type="number" min="0" {...register('membershipGracePeriod')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentReminderDays">Payment reminder days</Label>
                <Input id="paymentReminderDays" type="number" min="0" {...register('paymentReminderDays')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellationPolicyHours">Cancellation policy (hours)</Label>
                <Input id="cancellationPolicyHours" type="number" min="0" {...register('cancellationPolicyHours')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAdvanceBookingDays">Max advance booking (days)</Label>
                <Input id="maxAdvanceBookingDays" type="number" min="1" {...register('maxAdvanceBookingDays')} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 md:col-span-2">
                <div>
                  <Label htmlFor="autoRenewDefault" className="text-sm font-medium text-gray-900">
                    Auto-renew default
                  </Label>
                  <p className="text-xs text-gray-500">New memberships renew automatically by default.</p>
                </div>
                <Switch
                  id="autoRenewDefault"
                  checked={autoRenewDefault}
                  onCheckedChange={(value) => setValue('autoRenewDefault', value)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 md:col-span-2">
                <div>
                  <Label htmlFor="waitlistEnabled" className="text-sm font-medium text-gray-900">
                    Waitlist enabled
                  </Label>
                  <p className="text-xs text-gray-500">Allow waitlists when classes are full.</p>
                </div>
                <Switch
                  id="waitlistEnabled"
                  checked={waitlistEnabled}
                  onCheckedChange={(value) => setValue('waitlistEnabled', value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      )}
    </main>
  )
}
