const SITE_URL = 'https://www.cape-frontier.co.za'

/**
 * Builds Product + AggregateRating + Review JSON-LD for a single tour,
 * computed from the reviews.js array (matched via tourSlug) rather than
 * hand-set fields on the tour object — single source of truth, and the
 * rating/count can never drift out of sync with what's actually shown.
 *
 * @param {object} tour - a tour from tours.js
 * @param {object[]} allReviews - the full reviews array from reviews.js
 */
export function buildTourSchema(tour, allReviews = []) {
  const url = `${SITE_URL}${tour.canonicalPath}`
  const image = tour.images?.length ? tour.images : [tour.image].filter(Boolean)

  // Only verified reviews for this tour feed the schema — never mix in
  // unmoderated submissions.
  const tourReviews = allReviews.filter(
    (r) => r.tourSlug === tour.slug && r.verified
  )

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tour.title,
    description: tour.description,
    image,
    url,
    brand: {
      '@type': 'Brand',
      name: 'Cape Frontier',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: tour.baseCurrency || 'ZAR',
      price: tour.priceBase,
      availability: 'https://schema.org/InStock',
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
    },
  }

  if (tourReviews.length > 0) {
    const avgRating =
      tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length

    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Math.round(avgRating * 10) / 10,
      bestRating: 5,
      reviewCount: tourReviews.length,
    }

    // Google recommends not dumping every review into the page schema —
    // a handful of the most recent/representative is fine and avoids an
    // enormous JSON-LD payload as review volume grows.
    schema.review = tourReviews.slice(0, 10).map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
      },
      author: {
        '@type': 'Person',
        name: r.name,
      },
      reviewBody: r.desc,
      ...(r.date && { datePublished: parseReviewDate(r.date) }),
    }))
  }

  return schema
}

// reviews.js stores dates like "May 2026" — convert to ISO for schema.org.
function parseReviewDate(dateStr) {
  const parsed = new Date(`1 ${dateStr}`)
  return isNaN(parsed) ? undefined : parsed.toISOString().slice(0, 10)
}

/**
 * Site-wide Organization schema — include once, e.g. in App.jsx's <Seo>
 * or a top-level Helmet, not per-page.
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Cape Frontier',
    url: SITE_URL,
    // logo: `${SITE_URL}/logo.png`,
    // sameAs: [
    //   'https://www.instagram.com/capefrontier',
    //   'https://www.facebook.com/capefrontier',
    // ],
  }
}