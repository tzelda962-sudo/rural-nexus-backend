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

function buildHtml(data: ContactEmailPayload): string {
  const name = escapeHtml(`${data.firstName} ${data.lastName}`)
  const email = escapeHtml(data.email)
  const interestArea = escapeHtml(data.interestArea)
  const message = escapeHtml(data.message).replace(/\n/g, '<br>')
  const orgRow = data.organization
    ? `<tr>
        <td style="padding:0 0 6px 0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;">Organization</td>
      </tr>
      <tr>
        <td style="padding:0 0 20px 0;font-size:15px;color:#111827;">${escapeHtml(data.organization)}</td>
      </tr>`
    : ''

  // Inline SVG hexagon — works in Gmail, Apple Mail, Outlook web
  const hex = (size: number, fill: string, opacity = 1) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 116" style="display:inline-block;opacity:${opacity};">` +
    `<polygon points="50,2 98,26 98,90 50,114 2,90 2,26" fill="${fill}" stroke="none"/>` +
    `</svg>`

  // No <!DOCTYPE> — some Resend processing strips it and causes HTML_MIME_NO_HTML_TAG in SpamAssassin
  return `<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Inquiry — RuralNexus</title>
</head>
<body style="margin:0;padding:0;background-color:#EEF2F7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF2F7;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">

          <!-- ── HEADER ─────────────────────────────────────── -->
          <tr>
            <td style="background-color:#1B3A6B;padding:0;position:relative;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Hex decorations left -->
                  <td width="80" style="padding:32px 0 32px 28px;vertical-align:middle;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr><td style="padding:0 0 6px 0;">${hex(38, '#FFFFFF', 0.12)}</td></tr>
                      <tr><td style="padding-left:20px;">${hex(26, '#3D9A6A', 0.35)}</td></tr>
                    </table>
                  </td>
                  <!-- Wordmark + subtitle -->
                  <td style="padding:36px 12px;vertical-align:middle;text-align:center;">
                    <div style="font-size:11px;font-weight:700;color:#7DC9A0;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:10px;">Field Communication</div>
                    <div style="font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;line-height:1;">RuralNexus</div>
                    <div style="margin-top:14px;display:inline-block;background-color:#E8A020;color:#FFFFFF;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;padding:5px 14px;border-radius:20px;">New Contact Inquiry</div>
                  </td>
                  <!-- Hex decorations right -->
                  <td width="80" style="padding:32px 28px 32px 0;vertical-align:middle;text-align:right;">
                    <table cellpadding="0" cellspacing="0" border="0" align="right">
                      <tr><td style="padding:0 0 6px 0;">${hex(26, '#E8A020', 0.3)}</td></tr>
                      <tr><td style="padding-right:16px;">${hex(38, '#FFFFFF', 0.08)}</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Bottom accent strip -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="60%" style="background-color:#3D9A6A;height:4px;"></td>
                  <td width="25%" style="background-color:#E8A020;height:4px;"></td>
                  <td width="15%" style="background-color:#06B6D4;height:4px;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── BODY ───────────────────────────────────────── -->
          <tr>
            <td style="background-color:#FFFFFF;padding:40px 40px 32px;">

              <!-- Sender block -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#F3F7FF;border-left:4px solid #1B3A6B;border-radius:0 12px 12px 0;padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:0 0 4px 0;font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.12em;">From</td>
                      </tr>
                      <tr>
                        <td style="font-size:18px;font-weight:700;color:#111827;padding-bottom:4px;">${name}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#1B3A6B;font-weight:500;">${email}</td>
                      </tr>
                      ${data.organization ? `<tr><td style="font-size:12px;color:#6B7280;padding-top:4px;">${escapeHtml(data.organization)}</td></tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Interest area block -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#F0FBF5;border-left:4px solid #3D9A6A;border-radius:0 12px 12px 0;padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:0 0 6px 0;font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.12em;">Interest Area</td>
                      </tr>
                      <tr>
                        <td style="font-size:15px;font-weight:600;color:#111827;">${interestArea}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message block -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 0 10px 0;">
                    <span style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.12em;">Message</span>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#F8F9FC;border-radius:12px;padding:24px;font-size:15px;line-height:1.7;color:#374151;">
                    ${message}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── REPLY CTA ───────────────────────────────────── -->
          <tr>
            <td style="background-color:#FFFFFF;padding:0 40px 40px;text-align:center;">
              <a href="mailto:${email}?subject=Re: ${interestArea}"
                style="display:inline-block;background-color:#1B3A6B;color:#FFFFFF;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:12px;">
                Reply to ${escapeHtml(data.firstName)} &rarr;
              </a>
            </td>
          </tr>

          <!-- ── FOOTER ─────────────────────────────────────── -->
          <tr>
            <td style="background-color:#1B3A6B;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="font-size:14px;font-weight:700;color:#FFFFFF;margin-bottom:4px;">RuralNexus</div>
                    <div style="font-size:11px;color:#7DC9A0;letter-spacing:0.08em;">ruralnexus.org</div>
                  </td>
                  <td style="vertical-align:middle;text-align:right;">
                    ${hex(28, '#FFFFFF', 0.15)}
                    ${hex(20, '#3D9A6A', 0.3)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);margin-top:16px;">
                    <div style="font-size:11px;color:rgba(255,255,255,0.4);line-height:1.6;">
                      This is an automated notification from your website contact form.<br>
                      To reply, use the button above or email ${email} directly.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`
}

function buildText(data: ContactEmailPayload): string {
  const name = `${data.firstName} ${data.lastName}`
  const org = data.organization ? `\nOrganization: ${data.organization}` : ''
  return [
    'NEW CONTACT INQUIRY — RuralNexus',
    '='.repeat(40),
    '',
    `From:          ${name}`,
    `Email:         ${data.email}${org}`,
    `Interest area: ${data.interestArea}`,
    '',
    'MESSAGE',
    '-'.repeat(40),
    data.message,
    '',
    '='.repeat(40),
    'This is an automated notification from ruralnexus.org',
    `Reply directly to this email to contact ${data.firstName}.`,
  ].join('\n')
}

export async function sendContactEmail(data: ContactEmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || 'contact@mail.ruralnexus.org'
  const fromName = process.env.RESEND_FROM_NAME || 'RuralNexus Contact'
  const adminEmail = process.env.ADMIN_EMAIL

  if (!apiKey || !adminEmail) {
    throw new Error('Email not configured: RESEND_API_KEY and ADMIN_EMAIL are required')
  }

  const resend = new Resend(apiKey)
  const subject = `New inquiry: ${data.interestArea} — ${data.firstName} ${data.lastName}`

  const { error } = await resend.emails.send({
    from: `${fromName} <${from}>`,
    to: adminEmail,
    replyTo: data.email,
    subject,
    html: buildHtml(data),
    text: buildText(data),
  })

  if (error) {
    throw new Error(`Resend error: ${error.message ?? 'unknown'}`)
  }
}
