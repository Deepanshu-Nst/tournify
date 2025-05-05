"use client"

import { useEffect, useState } from "react"
import { AlertCircle, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"

export function OfflineAuthWarning() {
  const { user, isOnline } = useAuth()
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Show warning if user is in offline mode
    if (user?.offlineMode && !isOnline) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }, [user, isOnline])

  if (!showWarning) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" /> You're in offline mode
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          You're currently using Tournify in offline mode with limited functionality. Some features may not be available
          until you reconnect to the internet.
        </p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
          Refresh page
        </Button>
      </AlertDescription>
    </Alert>
  )
}
