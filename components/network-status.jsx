"use client"

import { useState, useEffect } from "react"
import { WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const { toast } = useToast()
  const { isOnline: authOnline } = useAuth()

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: "You're back online",
        description: "Your connection has been restored.",
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: "You're offline",
        description: "Some features may be unavailable until you reconnect.",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  // Use both local state and auth context to determine online status
  const actuallyOnline = isOnline && authOnline

  if (actuallyOnline) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-lg">
      <WifiOff className="h-4 w-4" />
      <span>You're offline</span>
    </div>
  )
}
