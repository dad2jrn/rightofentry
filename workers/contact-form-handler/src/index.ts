type Env = {
  ALLOWED_ORIGINS?: string
  FROM_EMAIL: string
  RATE_LIMIT_MAX?: string
  RATE_LIMITS: KVNamespace
  RESEND_API_KEY: string
  TO_EMAIL: string
}

type ContactRequest = {
  email?: unknown
  message?: unknown
  name?: unknown
  phone?: unknown
  reference?: unknown
  service?: unknown
}

type ContactSubmission = {
  email: string
  message: string
  name: string
  phone: string
  reference: string
  service: string
}

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:4321',
  'https://rightofentrylock.com',
  'https://www.rightofentrylock.com',
]

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  Vary: 'Origin',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_MESSAGE_LENGTH = 5000
const MIN_MESSAGE_LENGTH = 10
const MAX_SUBMISSIONS_PER_HOUR = 10

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const origin = request.headers.get('Origin')
    const corsHeaders = buildCorsHeaders(origin, env.ALLOWED_ORIGINS)

    if (request.method === 'OPTIONS') {
      if (!corsHeaders) {
        return jsonResponse({ error: 'Origin not allowed.' }, 403)
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    const url = new URL(request.url)

    if (url.pathname !== '/api/contact') {
      return jsonResponse({ error: 'Not found.' }, 404, corsHeaders)
    }

    if (!corsHeaders) {
      return jsonResponse({ error: 'Origin not allowed.' }, 403)
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed.' }, 405, {
        ...corsHeaders,
        Allow: 'POST, OPTIONS',
      })
    }

    if (!env.RESEND_API_KEY || !env.TO_EMAIL || !env.FROM_EMAIL) {
      console.error('Missing required worker secrets.')
      return jsonResponse({ error: 'Server configuration error.' }, 500, corsHeaders)
    }

    const submissionResult = await parseSubmission(request)

    if (!submissionResult.ok) {
      return jsonResponse({ error: submissionResult.error }, 400, corsHeaders)
    }

    const submission = submissionResult.data

    if (submission.reference) {
      console.log('Honeypot triggered. Accepting silently.')
      return jsonResponse({ success: true }, 200, corsHeaders)
    }

    const clientIp = getClientIp(request)
    const maxSubmissions = parsePositiveInteger(env.RATE_LIMIT_MAX) ?? MAX_SUBMISSIONS_PER_HOUR

    if (!clientIp) {
      console.warn('No client IP header found; continuing without rate limit.')
    } else {
      const rateLimitResult = await enforceRateLimit(env.RATE_LIMITS, clientIp, maxSubmissions)

      if (!rateLimitResult.allowed) {
        return jsonResponse(
          { error: 'Too many submissions from this IP. Please try again in about an hour.' },
          429,
          {
            ...corsHeaders,
            'Retry-After': String(rateLimitResult.retryAfterSeconds),
          },
        )
      }
    }

    const resendResponse = await sendEmail(env, submission, clientIp, request.cf?.colo)
    const resendBody = await resendResponse.text()

    if (!resendResponse.ok) {
      console.error('Resend request failed.', {
        body: resendBody,
        status: resendResponse.status,
      })

      return jsonResponse(
        { error: 'We could not send your message right now. Please call if this is urgent.' },
        502,
        corsHeaders,
      )
    }

    console.log('Contact form submission sent.', {
      email: submission.email,
      ip: clientIp,
      service: submission.service,
    })

    ctx.waitUntil(Promise.resolve())

    return jsonResponse({ success: true }, 200, corsHeaders)
  },
} satisfies ExportedHandler<Env>

const buildCorsHeaders = (origin: string | null, configuredOrigins?: string) => {
  if (!origin) {
    return {
      ...DEFAULT_HEADERS,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }
  }

  const allowedOrigins = new Set(
    [configuredOrigins, ...DEFAULT_ALLOWED_ORIGINS]
      .flatMap((value) => value?.split(',') ?? [])
      .map((value) => value.trim())
      .filter(Boolean),
  )

  if (!allowedOrigins.has(origin)) {
    return null
  }

  return {
    ...DEFAULT_HEADERS,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Origin': origin,
  }
}

const enforceRateLimit = async (namespace: KVNamespace, clientIp: string, maxSubmissions: number) => {
  const currentDate = new Date()
  const bucket = currentDate.toISOString().slice(0, 13)
  const key = `contact-rate:${clientIp}:${bucket}`
  const currentCount = parsePositiveInteger(await namespace.get(key)) ?? 0
  const nextCount = currentCount + 1
  const retryAfterSeconds = secondsUntilNextHour(currentDate)

  await namespace.put(key, String(nextCount), {
    expirationTtl: retryAfterSeconds + 60,
  })

  return {
    allowed: nextCount <= maxSubmissions,
    retryAfterSeconds,
  }
}

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')

  if (!forwardedFor) {
    return null
  }

  return forwardedFor.split(',')[0]?.trim() ?? null
}

const parseSubmission = async (
  request: Request,
): Promise<{ ok: true; data: ContactSubmission } | { ok: false; error: string }> => {
  let payload: ContactRequest

  try {
    payload = (await request.json()) as ContactRequest
  } catch {
    return { ok: false, error: 'Invalid JSON body.' }
  }

  const data: ContactSubmission = {
    email: normalizeString(payload.email),
    message: normalizeString(payload.message),
    name: normalizeString(payload.name),
    phone: normalizeString(payload.phone),
    reference: normalizeString(payload.reference),
    service: normalizeString(payload.service),
  }

  if (!data.name) {
    return { ok: false, error: 'Name is required.' }
  }

  if (!data.email) {
    return { ok: false, error: 'Email is required.' }
  }

  if (!EMAIL_PATTERN.test(data.email)) {
    return { ok: false, error: 'Enter a valid email address.' }
  }

  if (!data.service) {
    return { ok: false, error: 'Service is required.' }
  }

  if (!data.message) {
    return { ok: false, error: 'Message is required.' }
  }

  if (data.message.length < MIN_MESSAGE_LENGTH) {
    return { ok: false, error: `Message must be at least ${MIN_MESSAGE_LENGTH} characters.` }
  }

  if (data.message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` }
  }

  return { ok: true, data }
}

const sendEmail = async (
  env: Env,
  submission: ContactSubmission,
  clientIp: string | null,
  cloudflareColo: string | undefined,
) => {
  const safeService = submission.service || 'General inquiry'
  const subject = `New inquiry from ${submission.name} - ${safeService}`
  const html = renderHtmlEmail(submission, clientIp, cloudflareColo)
  const text = renderTextEmail(submission, clientIp, cloudflareColo)

  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'right-of-entry-contact-worker/1.0',
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [env.TO_EMAIL],
      subject,
      html,
      text,
      reply_to: submission.email,
    }),
  })
}

const renderHtmlEmail = (
  submission: ContactSubmission,
  clientIp: string | null,
  cloudflareColo: string | undefined,
) => {
  const rows = [
    ['Name', submission.name],
    ['Email', submission.email],
    ['Phone', submission.phone || 'Not provided'],
    ['Service', submission.service || 'Not provided'],
    ['Message', submission.message],
    ['Source IP', clientIp || 'Unavailable'],
    ['Cloudflare colo', cloudflareColo || 'Unavailable'],
  ]

  return [
    '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f1419;">',
    '<h1 style="margin:0 0 16px;font-size:24px;">New contact inquiry</h1>',
    '<table style="border-collapse:collapse;width:100%;max-width:720px;">',
    ...rows.map(
      ([label, value]) =>
        `<tr><th style="padding:8px 12px;border:1px solid #e5e3dd;text-align:left;background:#faf9f6;width:180px;">${escapeHtml(
          label,
        )}</th><td style="padding:8px 12px;border:1px solid #e5e3dd;white-space:pre-wrap;">${escapeHtml(
          value,
        )}</td></tr>`,
    ),
    '</table>',
    '</div>',
  ].join('')
}

const renderTextEmail = (
  submission: ContactSubmission,
  clientIp: string | null,
  cloudflareColo: string | undefined,
) =>
  [
    'New contact inquiry',
    '',
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Phone: ${submission.phone || 'Not provided'}`,
    `Service: ${submission.service || 'Not provided'}`,
    `Message: ${submission.message}`,
    `Source IP: ${clientIp || 'Unavailable'}`,
    `Cloudflare colo: ${cloudflareColo || 'Unavailable'}`,
  ].join('\n')

const normalizeString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const parsePositiveInteger = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const secondsUntilNextHour = (currentDate: Date) => {
  const nextHour = new Date(currentDate)
  nextHour.setMinutes(60, 0, 0)
  return Math.max(60, Math.ceil((nextHour.getTime() - currentDate.getTime()) / 1000))
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const jsonResponse = (
  payload: Record<string, string | boolean>,
  status: number,
  headers?: HeadersInit,
) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
  })
