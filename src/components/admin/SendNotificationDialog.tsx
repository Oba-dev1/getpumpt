'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { sendBulkNotification } from '@/lib/actions/notifications'
import { getMembers } from '@/lib/actions/members'
import type { SendNotificationInput } from '@/lib/validations'

type NotifType = SendNotificationInput['type']
type AudienceType = SendNotificationInput['audience']
type MembershipStatusType = NonNullable<SendNotificationInput['membershipStatus']>

const TYPE_OPTIONS = [
  { value: 'GENERAL', label: 'General' },
  { value: 'MEMBERSHIP', label: 'Membership' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'PROMO', label: 'Promo' },
]

const AUDIENCE_OPTIONS = [
  { value: 'ALL', label: 'All Members' },
  { value: 'SPECIFIC', label: 'Specific Member' },
  { value: 'MEMBERSHIP_STATUS', label: 'By Membership Status' },
]

const MEMBERSHIP_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'PAUSED', label: 'Paused' },
]

interface SendNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface MemberOption {
  id: string
  name: string
}

export function SendNotificationDialog({
  open,
  onOpenChange,
  onSuccess,
}: SendNotificationDialogProps) {
  const { data: session } = useSession()
  const gymId = session?.user?.gymId

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<NotifType>('GENERAL')
  const [audience, setAudience] = useState<AudienceType>('ALL')
  const [userId, setUserId] = useState('')
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatusType>('ACTIVE')
  const [members, setMembers] = useState<MemberOption[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (audience === 'SPECIFIC' && gymId && members.length === 0) {
      setLoadingMembers(true)
      getMembers(gymId, { limit: 500 })
        .then((result) => {
          setMembers(
            result.members.map((m) => ({
              id: m.id,
              name: `${m.firstName} ${m.lastName} (${m.email})`,
            }))
          )
        })
        .catch(() => {
          toast.error('Failed to load members')
        })
        .finally(() => setLoadingMembers(false))
    }
  }, [audience, gymId, members.length])

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (title.trim().length < 2) next.title = 'Title must be at least 2 characters'
    if (title.trim().length > 100) next.title = 'Title must be 100 characters or fewer'
    if (message.trim().length < 5) next.message = 'Message must be at least 5 characters'
    if (message.trim().length > 500) next.message = 'Message must be 500 characters or fewer'
    if (audience === 'SPECIFIC' && !userId) next.userId = 'Please select a member'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!gymId || !validate()) return

    setSubmitting(true)
    try {
      const result = await sendBulkNotification(gymId, {
        title: title.trim(),
        message: message.trim(),
        type,
        audience,
        userId: audience === 'SPECIFIC' ? userId : undefined,
        membershipStatus: audience === 'MEMBERSHIP_STATUS' ? membershipStatus : undefined,
      })

      if (result.count === 0) {
        toast.warning('No members matched the selected audience. No notifications were sent.')
      } else {
        toast.success(`Notification sent to ${result.count} member${result.count === 1 ? '' : 's'}`)
        handleReset()
        onOpenChange(false)
        onSuccess()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send notification')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setTitle('')
    setMessage('')
    setType('GENERAL' as NotifType)
    setAudience('ALL' as AudienceType)
    setUserId('')
    setMembershipStatus('ACTIVE' as MembershipStatusType)
    setErrors({})
  }

  const audienceLabel = () => {
    if (audience === 'ALL') return 'all members'
    if (audience === 'SPECIFIC') return '1 member'
    return `${membershipStatus.toLowerCase()} members`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
          <DialogDescription>
            Compose a notification and choose who receives it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="notif-title">Title</Label>
            <Input
              id="notif-title"
              placeholder="e.g. New class schedule available"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notif-message">Message</Label>
            <Textarea
              id="notif-message"
              placeholder="Enter the notification message..."
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
            />
            <p className="text-right text-xs text-gray-400">{message.length}/500</p>
            {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="notif-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as NotifType)}>
                <SelectTrigger id="notif-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notif-audience">Audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as AudienceType)}>
                <SelectTrigger id="notif-audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {audience === 'SPECIFIC' && (
            <div className="space-y-1.5">
              <Label htmlFor="notif-member">Member</Label>
              {loadingMembers ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading members...
                </div>
              ) : (
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger id="notif-member">
                    <SelectValue placeholder="Select a member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.userId && <p className="text-xs text-red-500">{errors.userId}</p>}
            </div>
          )}

          {audience === 'MEMBERSHIP_STATUS' && (
            <div className="space-y-1.5">
              <Label htmlFor="notif-status">Membership Status</Label>
              <Select value={membershipStatus} onValueChange={(v) => setMembershipStatus(v as MembershipStatusType)}>
                <SelectTrigger id="notif-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMBERSHIP_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              handleReset()
              onOpenChange(false)
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send to {audienceLabel()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
