const SITES = {
  coza: {
    key: "coza",
    origin: "https://www.cape-frontier.co.za",
    locale: "en_ZA",
    lang: "en-ZA",
    titleTag: "Book in Rand (ZAR)",
    descTag: "Local South African pricing in rand and a Cape Town-based team.",
    homeTitle: "Cape Town Tours Priced in Rand | Cape Frontier",
    homeDescription:
      "Small-group and private Cape Town tours with local pricing in rand, from iconic viewpoints to hidden local gems.",

    heroH1: "Cape Frontier: Cape Town tours priced in rand",
    tourTitleTag: "Priced in Rand",
    tourDescLead: "Book in rand.",
    tourIntro:
      "All prices are in South African rand (ZAR), so you know exactly what you will pay.",
  },
  com: {
    key: "com",
    origin: "https://www.cape-frontier.com",
    locale: "en_GB",
    lang: "en-GB",
    titleTag: "For International Visitors",
    descTag:
      "Plan your South Africa trip from abroad, with help from our Cape Town team.",
    homeTitle: "Plan Cape Town & Western Cape Tours | Cape Frontier",
    homeDescription:
      "Guided Cape Town and Western Cape tours for international visitors, planned with our local team before you arrive.",
    
    heroH1: "Cape Frontier: South Africa tours planned from abroad",
    tourTitleTag: "Plan From Abroad",
    tourDescLead: "Plan before you travel.",
    tourIntro:
      "Plan this tour before you arrive. Bookings are charged in South African rand and your bank converts the amount.",
  },
};

export const ORIGINS = { coza: SITES.coza.origin, com: SITES.com.origin };

export const site = SITES[import.meta.env.VITE_SITE] ?? SITES.coza;
