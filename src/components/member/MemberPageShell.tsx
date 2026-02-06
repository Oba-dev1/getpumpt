import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, type LucideIcon } from 'lucide-react'

interface MemberPageShellProps {
  title: string
  description: string
  sectionTitle: string
  sectionDescription: string
  icon: LucideIcon
  primaryActionHref?: string
  primaryActionLabel?: string
}

export function MemberPageShell({
  title,
  description,
  sectionTitle,
  sectionDescription,
  icon: Icon,
  primaryActionHref,
  primaryActionLabel,
}: MemberPageShellProps) {
  return (
    <main className="member-stack" aria-labelledby="member-page-title">
      <header>
        <h1
          id="member-page-title"
          className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-300">{description}</p>
      </header>

      <Card className="member-card">
        <CardHeader className="member-card-header">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/15 to-blue-500/15 text-cyan-300">
              <Icon className="h-4 w-4" />
            </span>
            <CardTitle className="text-base text-white">{sectionTitle}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="member-card-content space-y-3">
          <p className="text-sm text-slate-300">{sectionDescription}</p>
          {primaryActionHref && primaryActionLabel ? (
            <Button
              variant="outline"
              asChild
              className="h-9 border-white/15 bg-slate-900 px-3 text-sm text-slate-100 hover:bg-slate-800"
            >
              <Link href={primaryActionHref}>
                {primaryActionLabel}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}
