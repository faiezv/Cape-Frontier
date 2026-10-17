// api/_lib/site.js
// Resolves which public site a request came from, so payment return URLs
// (and anything else absolute) point back to the domain the customer is on.

const PROD_SITES = {
  'cape-frontier.co.za': { key: 'coza', origin: 'https://www.cape-frontier.co.za' },
  'cape-frontier.com': { key: 'com', origin: 'https://www.cape-frontier.com' },
}

const DEFAULT_SITE = PROD_SITES['cape-frontier.co.za']

export function getSite(req) {
  const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
  const host = rawHost.replace(/^www\./, '')

  if (PROD_SITES[host]) return PROD_SITES[host]

  // Preview deployments and local dev: stay on whichever host made the request
  if (rawHost && process.env.VERCEL_ENV !== 'production') {
    const proto =
      rawHost.startsWith('localhost') || rawHost.startsWith('127.') ? 'http' : 'https'
    return { key: 'dev', origin: `${proto}://${rawHost}` }
  }

  return DEFAULT_SITE
}