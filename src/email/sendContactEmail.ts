import { Resend } from 'resend'

export type ContactEmailPayload = {
  firstName: string
  lastName: string
  email: string
  organization?: string
  interestArea: string
  message: string
}

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export async function sendContactEmail(data: ContactEmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || 'contact@mail.ruralnexus.org'
  const fromName = process.env.RESEND_FROM_NAME || 'RuralNexus Contact'
  const adminEmail = process.env.ADMIN_EMAIL

  if (!apiKey || !adminEmail) {
    throw new Error('Email not configured: RESEND_API_KEY and ADMIN_EMAIL are required')
  }

  const resend = new Resend(apiKey)
  const name = `${data.firstName} ${data.lastName}`
  const subject = `New contact inquiry: ${data.interestArea}`
  const orgLine = data.organization
    ? `<p><strong>Organization:</strong> ${escapeHtml(data.organization)}</p>`
    : ''

  const html = `
    <h2>New contact inquiry</h2>
    <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(data.email)}&gt;</p>
    ${orgLine}
    <p><strong>Interest area:</strong> ${escapeHtml(data.interestArea)}</p>
    <h3>Message</h3>
    <p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
  `.trim()

  const { error } = await resend.emails.send({
    from: `${fromName} <${from}>`,
    to: adminEmail,
    replyTo: data.email,
    subject,
    html,
  })

  if (error) {
    throw new Error(`Resend error: ${error.message ?? 'unknown'}`)
  }
}
