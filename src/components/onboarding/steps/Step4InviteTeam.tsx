'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { sendTeamInvites } from '@/lib/actions/onboarding'
import { Mail, X, UserPlus } from 'lucide-react'

interface Step4InviteTeamProps {
  onComplete: () => void
}

export function Step4InviteTeam({ onComplete }: Step4InviteTeamProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [error, setError] = useState('')

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleAddEmail = () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Please enter an email address')
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    if (emails.includes(trimmedEmail)) {
      setError('This email has already been added')
      return
    }

    if (emails.length >= 10) {
      setError('Maximum 10 invites allowed')
      return
    }

    setEmails([...emails, trimmedEmail])
    setEmail('')
    setError('')
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove))
  }

  const handleSubmit = async () => {
    if (emails.length === 0) {
      toast.error('Please add at least one email address')
      return
    }

    setLoading(true)
    try {
      const result = await sendTeamInvites({ emails })
      if (result.success) {
        toast.success(`Invites sent to ${result.data?.sentCount} team members!`)
        onComplete()
      } else {
        toast.error(result.error || 'Failed to send invites')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="space-y-2">
        <CardTitle>Invite your team (optional)</CardTitle>
        <CardDescription>
          Add trainers or staff so they can help manage the gym.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="email">Team Member Email</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="email"
              type="email"
              placeholder="team@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddEmail()
                }
              }}
              disabled={loading}
              aria-describedby="invite-help invite-error"
            />
            <Button
              type="button"
              onClick={handleAddEmail}
              disabled={loading || !email.trim()}
              className="sm:w-auto"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
          {error && (
            <p id="invite-error" className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <p id="invite-help" className="text-sm text-muted-foreground">
            Press Enter or click Add to include up to 10 teammates.
          </p>
        </div>

        {emails.length > 0 && (
          <div className="space-y-3">
            <Label>Team Members to Invite ({emails.length})</Label>
            <div className="flex flex-wrap gap-2 rounded-xl border border-border/70 bg-muted/30 p-4">
              {emails.map((emailItem) => (
                <Badge
                  key={emailItem}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5"
                >
                  <Mail className="h-3 w-3" aria-hidden="true" />
                  <span>{emailItem}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(emailItem)}
                    disabled={loading}
                    className="ml-1 rounded-full p-0.5 transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Remove ${emailItem}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {emails.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/70 p-8 text-center">
            <Mail className="mx-auto mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              No team members added yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add email addresses above to send invitations.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">About team invites</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Invited members receive an email to join your gym.</li>
            <li>You can set roles and permissions after they accept.</li>
            <li>This step is optional, and you can invite teammates later.</li>
          </ul>
        </div>

        {emails.length > 0 && (
          <div className="border-t pt-4">
            <Button
              type="button"
              onClick={handleSubmit}
              loading={loading}
              className="w-full"
            >
              Send {emails.length} Invite{emails.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
