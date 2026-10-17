const SITES = {
  coza: { key: 'coza', origin: 'https://www.cape-frontier.co.za', locale: 'en_ZA' },
  com: { key: 'com', origin: 'https://www.cape-frontier.com', locale: 'en_GB' },
}

export const ORIGINS = { coza: SITES.coza.origin, com: SITES.com.origin }

// VITE_SITE is set per build in package.json; unset (dev) falls back to coza
export const site = SITES[import.meta.env.VITE_SITE] ?? SITES.coza