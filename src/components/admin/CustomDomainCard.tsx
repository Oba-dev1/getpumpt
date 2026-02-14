'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import {
  getCustomDomain,
  addCustomDomain,
  removeCustomDomain,
  checkDomainStatus,
} from '@/lib/actions/domains'
import type { DomainInfo, DomainStatus } from '@/lib/actions/domains'

interface CustomDomainCardProps {
  gymId: string
}

const STATUS_BADGE: Record<
  DomainStatus,
  { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }
> = {
  not_configured: { label: 'Not configured', variant: 'secondary' },
  pending_verification: { label: 'Pending', variant: 'warning' },
  verified: { label: 'Verified', variant: 'success' },
  misconfigured: { label: 'Misconfigured', variant: 'destructive' },
  error: { label: 'Error', variant: 'destructive' },
}

export function CustomDomainCard({ gymId }: CustomDomainCardProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [domainInput, setDomainInput] = useState('')
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null)

  const fetchDomain = useCallback(async () => {
    try {
      const info = await getCustomDomain(gymId)
      setDomainInfo(info)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load domain info'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [gymId])

  useEffect(() => {
    fetchDomain()
  }, [fetchDomain])

  const handleAdd = async () => {
    if (!domainInput.trim()) return

    setSaving(true)
    try {
      const info = await addCustomDomain(gymId, domainInput.trim())
      setDomainInfo(info)
      setDomainInput('')
      toast.success('Domain added successfully. Configure your DNS records below.')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add domain'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      await removeCustomDomain(gymId)
      setDomainInfo({ domain: null, status: 'not_configured', dnsRecords: [] })
      setShowRemoveDialog(false)
      toast.success('Custom domain removed')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove domain'
      toast.error(message)
    } finally {
      setRemoving(false)
    }
  }

  const handleCheckStatus = async () => {
    setChecking(true)
    try {
      const info = await checkDomainStatus(gymId)
      setDomainInfo(info)
      if (info.status === 'verified') {
        toast.success('Domain is verified and active')
      } else if (info.status === 'misconfigured') {
        toast.error('DNS records are misconfigured. Check the instructions below.')
      } else {
        toast.info('DNS is still propagating. This can take up to 48 hours.')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to check domain status'
      toast.error(message)
    } finally {
      setChecking(false)
    }
  }

  const badge = domainInfo ? STATUS_BADGE[domainInfo.status] : null

  return (
    <>
      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900">Custom domain</CardTitle>
            {domainInfo?.domain && badge && (
              <Badge variant={badge.variant}>{badge.label}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          ) : !domainInfo?.domain ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Domain</Label>
                <div className="flex gap-2">
                  <Input
                    id="customDomain"
                    placeholder="mygym.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAdd()
                      }
                    }}
                    disabled={saving}
                  />
                  <Button onClick={handleAdd} disabled={saving || !domainInput.trim()}>
                    {saving ? 'Adding...' : 'Add domain'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Enter your custom domain without http:// or www (e.g., mygym.com)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {domainInfo.domain}
                  </p>
                  {domainInfo.status === 'verified' && (
                    <a
                      href={`https://${domainInfo.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      https://{domainInfo.domain}
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  {domainInfo.status !== 'verified' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCheckStatus}
                      disabled={checking}
                    >
                      {checking ? 'Checking...' : 'Check status'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRemoveDialog(true)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {domainInfo.errorMessage && (
                <p className="text-xs text-amber-600">{domainInfo.errorMessage}</p>
              )}

              {domainInfo.status !== 'verified' &&
                domainInfo.dnsRecords.length > 0 && (
                  <DnsInstructions records={domainInfo.dnsRecords} />
                )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title="Remove custom domain"
        description={`This will remove ${domainInfo?.domain ?? 'the custom domain'} from your gym. Your site will still be accessible via your getpumpt.com subdomain.`}
        confirmLabel="Remove domain"
        variant="destructive"
        onConfirm={handleRemove}
        isLoading={removing}
      />
    </>
  )
}

function DnsInstructions({
  records,
}: {
  records: Array<{ type: string; name: string; value: string }>
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="mb-3 text-sm font-medium text-gray-900">
        Configure these DNS records at your domain registrar:
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-2 pr-4 font-medium text-gray-500">Type</th>
              <th className="pb-2 pr-4 font-medium text-gray-500">Name</th>
              <th className="pb-2 font-medium text-gray-500">Value</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={`${record.type}-${record.name}`} className="border-b border-gray-100 last:border-0">
                <td className="py-2 pr-4 font-mono text-gray-900">{record.type}</td>
                <td className="py-2 pr-4 font-mono text-gray-900">{record.name}</td>
                <td className="py-2 font-mono text-gray-900">{record.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        DNS changes can take up to 48 hours to propagate. Click &ldquo;Check
        status&rdquo; to verify.
      </p>
    </div>
  )
}
