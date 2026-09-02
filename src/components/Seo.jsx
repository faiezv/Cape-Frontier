import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://www.cape-frontier.co.za'

export default function Seo({ title, description, path, noindex = false }) {
  const canonical = `${SITE_URL}${path}`

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <link rel="canonical" href={canonical} />
      )}
    </Helmet>
  )
}
