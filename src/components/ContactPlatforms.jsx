import React from 'react'

const defaultPlatforms = [
  {
    name: 'Facebook',
    icon: '/icons/facebook.png',
    href: '#facebook',
  },
  {
    name: 'Instagram',
    icon: '/icons/instagram.png',
    href: '#instagram',
  },
  {
    name: 'X',
    icon: '/icons/x.png',
    href: '#x',
  },
  {
    name: 'Gmail',
    icon: '/icons/mail.png',
    href: 'mailto:admin@cape-frontier.co.za',
  },
  {
    name: 'WhatsApp',
    icon: '/icons/whatsapp.png',
    href: '#whatsapp',
  },
  {
    name: 'Share',
    icon: '/icons/share.png',
    href: '#share',
    isShare: true,
  },
]

function ContactPlatforms({
  platforms = defaultPlatforms,
  className = '',
  compact = false,
  cta = 'Need help? message us here.',
}) {
  const handleClick = async (event, platform) => {
    if (!platform.isShare) return

    event.preventDefault()

    const shareData = {
      title: 'Cape Frontier Travel and Tours',
      text: 'Explore Cape Town tours with Cape Frontier Travel and Tours.',
      url: typeof window !== 'undefined' ? window.location.href : '',
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled native share.
      }

      return
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard && shareData.url) {
      await navigator.clipboard.writeText(shareData.url)
    }
  }

  return (
    <div className={`flex w-fit flex-col py-20 items-center ${className}`}>
      <div
        className="flex w-fit items-center gap-2 rounded-full border border-black/6 bg-white/80 px-2.5 py-2 shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur-md"
        aria-label="Contact platforms"
      >
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.href}
            onClick={(event) => handleClick(event, platform)}
            target={platform.href?.startsWith('http') ? '_blank' : undefined}
            rel={platform.href?.startsWith('http') ? 'noreferrer' : undefined}
            aria-label={platform.name}
            className={`group flex shrink-0 items-center justify-center rounded-full border border-black/6 bg-white text-blue-800 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-50 hover:text-green-800 ${
              compact ? 'h-9 w-9' : 'h-10 w-10 sm:h-11 sm:w-11'
            }`}
          >
            <span
              className={`block bg-current transition duration-300 ${
                compact ? 'h-5 w-5' : 'h-5 w-5 sm:h-6 sm:w-6'
              }`}
              style={{
                WebkitMaskImage: `url(${platform.icon})`,
                maskImage: `url(${platform.icon})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
              }}
              aria-hidden="true"
            />
          </a>
        ))}
      </div>

      {cta && (
        <p className="py-2 font-bitter text-[11px] font-semibold leading-tight text-black/45 sm:text-xs">
          {cta}
        </p>
      )}
    </div>
  )
}

export default ContactPlatforms