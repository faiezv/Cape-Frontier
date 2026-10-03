import { useEffect, useState } from 'react'

export default function useHeroReady(fallbackMs = 2500) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const markReady = () => setReady(true)

    if (window.__layoutStable) markReady()
    else window.addEventListener('app:layout-stable', markReady, { once: true })

    const fallback = setTimeout(markReady, fallbackMs) // never stay hidden

    return () => {
      window.removeEventListener('app:layout-stable', markReady)
      clearTimeout(fallback)
    }
  }, [fallbackMs])

  return ready
}