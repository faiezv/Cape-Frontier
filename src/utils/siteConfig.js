const SITES = {
  coza: {
    key: 'coza',
    origin: 'https://www.cape-frontier.co.za',
    locale: 'en_ZA',
    lang: 'en-ZA',
    titleTag: 'Book in Rand (ZAR)',
    descTag: 'Local South African pricing in rand and a Cape Town-based team.',
    homeTitle: 'Cape Town Tours Priced in Rand | Cape Frontier',
    homeDescription:
      'Small-group and private Cape Town tours with local pricing in rand, from iconic viewpoints to hidden local gems.',
  },
  com: {
    key: 'com',
    origin: 'https://www.cape-frontier.com',
    locale: 'en_GB',
    lang: 'en-GB',
    titleTag: 'For International Visitors',
    descTag: 'Plan your South Africa trip from abroad, with help from our Cape Town team.',
    homeTitle: 'Plan Cape Town & Western Cape Tours | Cape Frontier',
    homeDescription:
      'Guided Cape Town and Western Cape tours for international visitors, planned with our local team before you arrive.',
  },
}

export const ORIGINS = { coza: SITES.coza.origin, com: SITES.com.origin }

export const site = SITES[import.meta.env.VITE_SITE] ?? SITES.coza