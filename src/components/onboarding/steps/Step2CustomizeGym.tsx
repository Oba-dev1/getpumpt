'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateOnboardingBranding } from '@/lib/actions/onboarding'
import { onboardingBrandingSchema, type OnboardingBrandingInput } from '@/lib/validations/onboarding'
import { Palette } from 'lucide-react'

interface Step2CustomizeGymProps {
  onComplete: () => void
}

export function Step2CustomizeGym({ onComplete }: Step2CustomizeGymProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingBrandingInput>({
    resolver: zodResolver(onboardingBrandingSchema),
    defaultValues: {
      logo: '',
      primaryColor: '#1d4ed8',
    },
  })

  const primaryColor = watch('primaryColor')
  const logo = watch('logo')
  const presetColors = [
    '#1d4ed8',
    '#0f766e',
    '#0f172a',
    '#111827',
    '#1f2937',
    '#15803d',
    '#b45309',
    '#b91c1c',
    '#6d28d9',
    '#0e7490',
  ]

  const onSubmit = async (data: OnboardingBrandingInput) => {
    setLoading(true)
    try {
      const result = await updateOnboardingBranding(data)
      if (result.success) {
        toast.success('Branding updated successfully!')
        onComplete()
      } else {
        toast.error(result.error || 'Failed to update branding')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-border/70 shadow-none">
        <CardHeader className="space-y-2">
          <CardTitle>Customize your gym&apos;s branding</CardTitle>
          <CardDescription>
            Add a logo and pick a primary color that meets contrast guidelines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL (Optional)</Label>
            <Input
              id="logo"
              type="url"
              placeholder="https://example.com/logo.png"
              aria-describedby="logo-help"
              {...register('logo')}
              disabled={loading}
            />
            {errors.logo && (
              <p className="text-sm text-destructive" role="alert">
                {errors.logo.message}
              </p>
            )}
            <p id="logo-help" className="text-sm text-muted-foreground">
              Use a square logo with a transparent background when possible.
            </p>

            {logo && (
              <div className="mt-3 rounded-xl border border-border/70 p-4">
                <p className="text-sm font-medium text-foreground">Logo preview</p>
                <div className="mt-3 flex items-center justify-center rounded-lg bg-muted/40 p-4">
                  <img
                    src={logo}
                    alt="Logo preview"
                    className="max-h-20 max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = ''
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Brand Color *</Label>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
                {presetColors.map((color) => {
                  const isSelected = color.toLowerCase() === primaryColor.toLowerCase()
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('primaryColor', color)}
                      className={`h-10 w-10 rounded-full border transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'border-border'}`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                      aria-pressed={isSelected}
                      disabled={loading}
                    />
                  )
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <Label htmlFor="primaryColor">Custom HEX</Label>
                  <Input
                    id="primaryColor"
                    type="text"
                    inputMode="text"
                    placeholder="#1d4ed8"
                    {...register('primaryColor')}
                    disabled={loading}
                    aria-describedby="color-help"
                    className="mt-2 font-mono"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-lg border border-border"
                    style={{ backgroundColor: primaryColor }}
                    aria-label={`Selected color ${primaryColor}`}
                  />
                  <div className="text-sm">
                    <p className="font-semibold font-mono text-foreground">
                      {primaryColor}
                    </p>
                    <p className="text-muted-foreground">Selected color</p>
                  </div>
                </div>
              </div>
            </div>
            {errors.primaryColor && (
              <p className="text-sm text-destructive" role="alert">
                {errors.primaryColor.message}
              </p>
            )}
            <p id="color-help" className="text-sm text-muted-foreground">
              Pick a color that keeps text readable on light and dark backgrounds.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Palette className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-foreground">Branding tips</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  <li>Choose a primary color with strong contrast.</li>
                  <li>Use the same color across buttons and links.</li>
                  <li>You can update branding anytime in Settings.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {logo ? (
                  <img
                    src={logo}
                    alt="Preview"
                    className="h-full w-full rounded-lg object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-lg font-semibold">GYM</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Preview</p>
                <p className="text-xs text-muted-foreground">
                  This is how your branding will appear.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
