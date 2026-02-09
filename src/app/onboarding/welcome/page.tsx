'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, ArrowRight, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export default function WelcomePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)

  const gymSlug = session?.user?.gymSlug || ''
  const subdomain = `${gymSlug}.gymflowpro.com`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(subdomain)
      setCopied(true)
      toast.success('URL copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  const handleContinue = () => {
    router.push('/onboarding/setup')
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10">
      <header className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-400/10">
          <Check className="h-7 w-7 text-emerald-300" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Welcome to GymFlowPro
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Your gym account is ready. Share your URL and finish setup in minutes.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-background">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your Gym Website URL
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
                  <p className="text-lg font-semibold text-foreground sm:text-xl">
                    {subdomain}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Share this with members so they can find your gym online.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCopy}
                  className="gap-2 rounded-xl"
                  aria-label="Copy gym URL"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? 'Copied' : 'Copy URL'}
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border/70 p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Preview your gym website (after setup)
              </div>
              <div className="mt-4 flex min-h-[180px] items-center justify-center rounded-xl border border-border/50 bg-muted/30">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                    <div className="h-5 w-5 rounded bg-primary/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Your preview will appear here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Complete setup to customize your site
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-border/70 bg-background">
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                What happens next
              </p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    1
                  </span>
                  Add a membership plan
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    2
                  </span>
                  Customize your branding
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    3
                  </span>
                  Invite your team (optional)
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-border/70 bg-background p-6">
            <h2 className="text-lg font-semibold">Ready to finish setup?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll guide you through 4 quick steps. Most gyms finish in under 5 minutes.
            </p>
            <Button size="lg" onClick={handleContinue} className="mt-6 w-full">
              Continue to Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
