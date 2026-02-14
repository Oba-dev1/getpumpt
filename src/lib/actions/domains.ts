'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireGymPermission } from '@/lib/auth-helpers'
import {
  addDomainToVercel,
  removeDomainFromVercel,
  getDomainConfig,
  verifyDomain as verifyDomainOnVercel,
} from '@/lib/vercel'

const domainSchema = z
  .string()
  .min(4, 'Domain is too short')
  .max(253, 'Domain is too long')
  .regex(
    /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
    'Enter a valid domain (e.g., mygym.com) without http:// or trailing slash'
  )
  .transform((val) => val.toLowerCase().trim())

export type DomainStatus =
  | 'not_configured'
  | 'pending_verification'
  | 'verified'
  | 'misconfigured'
  | 'error'

export interface DomainInfo {
  domain: string | null
  status: DomainStatus
  dnsRecords: Array<{ type: string; name: string; value: string }>
  errorMessage?: string
}

function buildDnsRecords(
  domain: string,
  verification?: Array<{ type: string; domain: string; value: string }>
): Array<{ type: string; name: string; value: string }> {
  const records: Array<{ type: string; name: string; value: string }> = []

  const isApex = domain.split('.').length === 2

  if (isApex) {
    records.push({ type: 'A', name: '@', value: '76.76.21.21' })
  } else {
    records.push({
      type: 'CNAME',
      name: domain.split('.')[0],
      value: 'cname.vercel-dns.com',
    })
  }

  if (verification) {
    for (const record of verification) {
      records.push({
        type: record.type,
        name: record.domain,
        value: record.value,
      })
    }
  }

  return records
}

export async function getCustomDomain(gymId: string): Promise<DomainInfo> {
  await requireGymPermission(gymId, 'settings:manage')

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { customDomain: true },
  })

  if (!gym?.customDomain) {
    return { domain: null, status: 'not_configured', dnsRecords: [] }
  }

  const domain = gym.customDomain

  try {
    const config = await getDomainConfig(domain)

    if (config.misconfigured) {
      return {
        domain,
        status: 'misconfigured',
        dnsRecords: buildDnsRecords(domain),
      }
    }

    return {
      domain,
      status: 'verified',
      dnsRecords: buildDnsRecords(domain),
    }
  } catch {
    return {
      domain,
      status: 'pending_verification',
      dnsRecords: buildDnsRecords(domain),
      errorMessage: 'Unable to check domain status. DNS may still be propagating.',
    }
  }
}

export async function addCustomDomain(
  gymId: string,
  rawDomain: string
): Promise<DomainInfo> {
  await requireGymPermission(gymId, 'settings:manage')

  const domain = domainSchema.parse(rawDomain)

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'getpumpt.com'
  if (domain.endsWith(rootDomain) || domain.endsWith('.vercel.app')) {
    throw new Error('Cannot use a platform subdomain as a custom domain')
  }

  const existing = await prisma.gym.findUnique({
    where: { customDomain: domain },
    select: { id: true },
  })

  if (existing && existing.id !== gymId) {
    throw new Error('This domain is already in use by another gym')
  }

  const vercelResponse = await addDomainToVercel(domain)

  try {
    await prisma.gym.update({
      where: { id: gymId },
      data: { customDomain: domain },
    })
  } catch {
    await removeDomainFromVercel(domain).catch(() => {})
    throw new Error('Failed to save domain configuration. Please try again.')
  }

  revalidatePath('/admin/settings')

  const status: DomainStatus = vercelResponse.verified
    ? 'verified'
    : 'pending_verification'

  return {
    domain,
    status,
    dnsRecords: buildDnsRecords(domain, vercelResponse.verification),
  }
}

export async function removeCustomDomain(gymId: string): Promise<void> {
  await requireGymPermission(gymId, 'settings:manage')

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { customDomain: true },
  })

  if (!gym?.customDomain) {
    throw new Error('No custom domain to remove')
  }

  try {
    await removeDomainFromVercel(gym.customDomain)
  } catch {
    // Best-effort removal from Vercel; still clear DB
  }

  await prisma.gym.update({
    where: { id: gymId },
    data: { customDomain: null },
  })

  revalidatePath('/admin/settings')
}

export async function checkDomainStatus(gymId: string): Promise<DomainInfo> {
  await requireGymPermission(gymId, 'settings:manage')

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { customDomain: true },
  })

  if (!gym?.customDomain) {
    return { domain: null, status: 'not_configured', dnsRecords: [] }
  }

  const domain = gym.customDomain

  try {
    const vercelResponse = await verifyDomainOnVercel(domain)
    const config = await getDomainConfig(domain)

    if (vercelResponse.verified && !config.misconfigured) {
      return {
        domain,
        status: 'verified',
        dnsRecords: buildDnsRecords(domain),
      }
    }

    if (config.misconfigured) {
      return {
        domain,
        status: 'misconfigured',
        dnsRecords: buildDnsRecords(domain, vercelResponse.verification),
      }
    }

    return {
      domain,
      status: 'pending_verification',
      dnsRecords: buildDnsRecords(domain, vercelResponse.verification),
    }
  } catch {
    return {
      domain,
      status: 'error',
      dnsRecords: buildDnsRecords(domain),
      errorMessage:
        'Unable to verify domain status. Please try again in a few minutes.',
    }
  }
}
