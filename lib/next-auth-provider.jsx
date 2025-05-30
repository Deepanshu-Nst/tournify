"use client"

import { SessionProvider } from "next-auth/react"
import { useState, useEffect } from "react"

export function NextAuthProvider({ children }) {
  // Add client-side error handling
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  )
}
