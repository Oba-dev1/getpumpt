/**
 * SMS provider wrapper using Termii (https://termii.com)
 * Nigerian-optimised SMS delivery with DND transactional route support.
 */

const TERMII_BASE_URL = 'https://v3.api.termii.com/api'

interface TermiiSendResponse {
  message_id?: string
  message?: string
  balance?: number
  user?: string
  code?: string
}

export async function sendSms(to: string, message: string): Promise<void> {
  const apiKey = process.env.TERMII_API_KEY
  const senderId = process.env.TERMII_SENDER_ID

  if (!apiKey) {
    throw new Error('TERMII_API_KEY is not configured')
  }

  const payload = {
    api_key: apiKey,
    to,
    from: senderId ?? 'GetPumpt',
    sms: message,
    type: 'plain',
    channel: 'dnd', // transactional DND route — bypasses Do Not Disturb for OTPs
  }

  const response = await fetch(`${TERMII_BASE_URL}/sms/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`SMS delivery failed (${response.status}): ${body}`)
  }

  const data: TermiiSendResponse = await response.json()

  // Termii returns code "ok" or similar on success; treat non-error HTTP as success
  if (data.code && data.code !== 'ok') {
    throw new Error(`SMS delivery error: ${data.message ?? data.code}`)
  }
}

export async function sendOtpSms(to: string, code: string, gymName: string): Promise<void> {
  const message = `Your ${gymName} login code is ${code}. It expires in 10 minutes. Do not share this code with anyone.`
  await sendSms(to, message)
}
