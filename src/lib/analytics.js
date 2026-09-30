const GA_ID = import.meta.env.VITE_GA_ID

export function initGA() {
  if (typeof window === 'undefined' || !GA_ID || window.__gaReady) return
  window.__gaReady = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer.push(arguments) // must be `arguments`, not an arrow fn
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false }) // we send them manually

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
}

export function pageview(path) {
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export function track(name, params) {
  window.gtag?.('event', name, params)
}