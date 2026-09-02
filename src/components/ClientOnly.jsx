import { useEffect, useState } from 'react'

export default function ClientOnly({ children, fallback = null }) {
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, [])
  return hasMounted ? children : fallback
}