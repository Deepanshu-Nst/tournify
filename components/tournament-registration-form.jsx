"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { registerForTournament } from "@/lib/tournament-service"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function TournamentRegistrationForm({ tournamentId, registrationType, tournamentName }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    teamName: "",
    teamSize: "",
    contactEmail: "",
    contactPhone: "",
    additionalInfo: "",
  })

  const isPaid = registrationType === "Paid"

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsRegistering(true)

    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to register for this tournament.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // For paid tournaments, redirect to payment page (to be implemented)
      if (isPaid) {
        toast({
          title: "Payment required",
          description: "You will be redirected to the payment page.",
        })
        // Implement payment flow here
        // For now, just register without payment
      }

      // Register for the tournament
      await registerForTournament(
        tournamentId,
        {
          ...formData,
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || user.email.split("@")[0],
          registrationDate: new Date().toISOString(),
        },
        user.uid,
      )

      toast({
        title: "Registration Successful",
        description: "You have successfully registered for this tournament. Check your email for confirmation.",
      })

      // Redirect to success page
      router.push(`/tournaments/${tournamentId}/registration-success`)
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error.message || "There was an error registering for this tournament. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
      setShowDialog(false)
    }
  }

  return (
    <>
      <Button
        className="w-full"
        size="lg"
        onClick={() => {
          if (!user) {
            toast({
              title: "Sign in required",
              description: "Please sign in to register for this tournament.",
              variant: "destructive",
            })
            router.push("/login")
            return
          }
          setShowDialog(true)
        }}
      >
        Register Now {isPaid && "(Paid)"}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tournament Registration</DialogTitle>
            <DialogDescription>
              {isPaid
                ? `Fill out the form below to register for ${tournamentName}. Payment will be required to complete registration.`
                : `Fill out the form below to register for ${tournamentName}.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="teamName">Team Name</Label>
              <Input id="teamName" name="teamName" value={formData.teamName} onChange={handleInputChange} required />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="teamSize">Number of Players</Label>
              <Input
                id="teamSize"
                name="teamSize"
                type="number"
                min="1"
                value={formData.teamSize}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail || (user ? user.email : "")}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>

              <Button type="submit" disabled={isRegistering}>
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
