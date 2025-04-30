"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createCheckoutSession } from "@/app/actions/payment"
import { useAuth } from "@/lib/auth"

export default function PaymentButton({ tournamentId, tournamentName, price }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { isSignedIn, user } = useAuth()

  const handlePayment = async () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to register for this tournament.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { url } = await createCheckoutSession({
        tournamentId,
        tournamentName,
        price,
        userId: user.id,
        userEmail: user.email,
      })

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading} className="w-full">
      {isLoading ? "Processing..." : `Pay $${price.toFixed(2)}`}
    </Button>
  )
}
