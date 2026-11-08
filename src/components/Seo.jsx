// src/components/Seo.jsx
import { Head } from "vite-react-ssg";
import { site, ORIGINS } from "../utils/siteConfig.js";

const SITE_URL = site.origin; // www.cape-frontier.co.za or www.cape-frontier.com, per build
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

// Append the regional tag only if the result stays a sensible length
function withTag(base, tag, max, sep) {
  if (!base || !tag) return base;
  const combined = `${base}${sep}${tag}`;
  return combined.length <= max ? combined : base;
}

export default function Seo({
  title,
  description,
  path,
  image,
  noindex = false,
  jsonLd, // a single object or an array of objects
  regionalTag = true, // optional string to append to title and description for regional differentiation
}) {
  const canonical = `${SITE_URL}${path}`;
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : DEFAULT_OG_IMAGE;

  const jsonLdItems = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  const pageTitle = regionalTag
    ? withTag(title, site.titleTag, 65, " | ")
    : title;
  const pageDescription = regionalTag
    ? withTag(description, site.descTag, 160, " ")
    : description;

  return (
    <Head>
      <html lang={site.lang} />
      <title>{pageTitle}</title>
      {pageDescription && <meta name="description" content={pageDescription} />}

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical + hreflang set (indexable pages only) */}
      {!noindex && <link rel="canonical" href={canonical} />}
      {!noindex && (
        <link
          rel="alternate"
          hrefLang="en-za"
          href={`${ORIGINS.coza}${path}`}
        />
      )}
      {!noindex && (
        <link rel="alternate" hrefLang="en" href={`${ORIGINS.com}${path}`} />
      )}
      {!noindex && (
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${ORIGINS.com}${path}`}
        />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={path === "/" ? "website" : "article"} />
      <meta property="og:site_name" content="Cape Frontier" />
      <meta property="og:locale" content={site.locale} />
      <meta property="og:title" content={pageTitle} />
      {pageDescription && (
        <meta property="og:description" content={pageDescription} />
      )}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      {pageDescription && (
        <meta name="twitter:description" content={pageDescription} />
      )}
      <meta name="twitter:image" content={ogImage} />

      {/* Structured data */}
      {jsonLdItems.map((item, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Head>
  );
}
