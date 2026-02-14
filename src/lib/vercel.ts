import 'server-only'

const VERCEL_API_BASE = 'https://api.vercel.com'

interface VercelDomainResponse {
  name: string
  apexName: string
  verified: boolean
  verification?: Array<{
    type: string
    domain: string
    value: string
    reason: string
  }>
}

interface VercelDomainConfig {
  configuredBy: string | null
  acceptedChallenges: string[]
  misconfigured: boolean
}

interface VercelErrorResponse {
  error: {
    code: string
    message: string
  }
}

function getVercelHeaders(): HeadersInit {
  const token = process.env.VERCEL_API_TOKEN
  if (!token) {
    throw new Error('VERCEL_API_TOKEN is not configured')
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

function getProjectId(): string {
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!projectId) {
    throw new Error('VERCEL_PROJECT_ID is not configured')
  }
  return projectId
}

async function handleVercelError(response: Response): Promise<never> {
  let body: VercelErrorResponse | null = null
  try {
    body = (await response.json()) as VercelErrorResponse
  } catch {
    throw new Error(`Vercel API returned HTTP ${response.status}`)
  }

  const code = body?.error?.code ?? 'unknown'
  const message = body?.error?.message ?? 'Unknown Vercel API error'

  if (code === 'domain_already_in_use') {
    throw new Error(
      'This domain is already registered on another Vercel project. Remove it there first.'
    )
  }
  if (code === 'invalid_domain') {
    throw new Error('Invalid domain format. Please enter a valid domain name.')
  }
  if (code === 'forbidden') {
    throw new Error('Vercel API access denied. Check your API token permissions.')
  }

  throw new Error(`Vercel API error: ${message}`)
}

export async function addDomainToVercel(
  domain: string
): Promise<VercelDomainResponse> {
  const projectId = getProjectId()
  const response = await fetch(
    `${VERCEL_API_BASE}/v10/projects/${projectId}/domains`,
    {
      method: 'POST',
      headers: getVercelHeaders(),
      body: JSON.stringify({ name: domain }),
    }
  )

  if (!response.ok) {
    await handleVercelError(response)
  }

  return response.json() as Promise<VercelDomainResponse>
}

export async function removeDomainFromVercel(domain: string): Promise<void> {
  const projectId = getProjectId()
  const response = await fetch(
    `${VERCEL_API_BASE}/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}`,
    {
      method: 'DELETE',
      headers: getVercelHeaders(),
    }
  )

  if (!response.ok && response.status !== 404) {
    await handleVercelError(response)
  }
}

export async function getDomainConfig(
  domain: string
): Promise<VercelDomainConfig> {
  const response = await fetch(
    `${VERCEL_API_BASE}/v6/domains/${encodeURIComponent(domain)}/config`,
    {
      method: 'GET',
      headers: getVercelHeaders(),
    }
  )

  if (!response.ok) {
    await handleVercelError(response)
  }

  return response.json() as Promise<VercelDomainConfig>
}

export async function verifyDomain(
  domain: string
): Promise<VercelDomainResponse> {
  const projectId = getProjectId()
  const response = await fetch(
    `${VERCEL_API_BASE}/v10/projects/${projectId}/domains/${encodeURIComponent(domain)}/verify`,
    {
      method: 'POST',
      headers: getVercelHeaders(),
    }
  )

  if (!response.ok) {
    await handleVercelError(response)
  }

  return response.json() as Promise<VercelDomainResponse>
}
