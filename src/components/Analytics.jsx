import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initGA, pageview } from '../lib/analytics'

export default function Analytics() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    initGA()
  }, [])

  useEffect(() => {
    const id = setTimeout(() => pageview(pathname + search), 300)
    return () => clearTimeout(id)
  }, [pathname, search])

  return null
}