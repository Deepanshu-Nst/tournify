"use client"

import { useState, useEffect } from "react"
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
import { Loader2, Plus, Minus } from "lucide-react"

const MAX_TEAM_PLAYERS = 6

export default function TournamentRegistrationForm({
  tournamentId,
  registrationType,
  tournamentName,
  registrationMode = "team",
  isRegistrationFull,
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const isTeamMode = registrationMode !== "solo"
  const [formData, setFormData] = useState({
    teamName: "",
    contactEmail: "",
    contactPhone: "",
    discordHandle: "",
    additionalInfo: "",
  })
  const [players, setPlayers] = useState([
    {
      fullName: "",
      ign: "",
      email: "",
      role: "",
    },
  ])

  const isPaid = registrationType === "Paid"

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlayerChange = (index, field, value) => {
    setPlayers((prev) => prev.map((player, i) => (i === index ? { ...player, [field]: value } : player)))
  }

  const addPlayer = () => {
    if (!isTeamMode) return
    setPlayers((prev) =>
      prev.length >= MAX_TEAM_PLAYERS ? prev : [...prev, { fullName: "", ign: "", email: "", role: "" }],
    )
  }

  const removePlayer = (index) => {
    if (players.length === 1) return
    setPlayers((prev) => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        contactEmail: prev.contactEmail || user.email || "",
      }))
      setPlayers((prev) =>
        prev.map((player, index) =>
          index === 0
            ? {
                ...player,
                fullName: player.fullName || user.name || "",
                email: player.email || user.email || "",
              }
            : player,
        ),
      )
    }
  }, [user])

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
      const payload = {
        ...formData,
        teamName: isTeamMode ? formData.teamName : `${user.name || user.email}-solo`,
        mode: registrationMode,
        userId: user.id,
        userEmail: user.email,
        userName: user.name || user.email.split("@")[0],
        contactEmail: formData.contactEmail || user.email,
        playerCount: players.length,
        players,
      }

      await registerForTournament(tournamentId, payload)

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
        disabled={isRegistrationFull}
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
          if (isRegistrationFull) {
            toast({
              title: "Registration closed",
              description: "All slots for this tournament are filled.",
              variant: "destructive",
            })
            return
          }
          setShowDialog(true)
        }}
      >
        {isRegistrationFull ? "Registration Closed" : `Register Now ${isPaid ? "(Paid)" : ""}`}
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
            {isTeamMode && (
              <div className="grid w-full gap-1.5">
                <Label htmlFor="teamName">Team Name</Label>
                <Input id="teamName" name="teamName" value={formData.teamName} onChange={handleInputChange} required />
              </div>
            )}

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
              <Label htmlFor="discordHandle">Discord / Communication Handle</Label>
              <Input
                id="discordHandle"
                name="discordHandle"
                value={formData.discordHandle}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Players ({players.length}{isTeamMode ? ` / ${MAX_TEAM_PLAYERS}` : ""})</Label>
                {isTeamMode && players.length < MAX_TEAM_PLAYERS && (
                  <Button type="button" variant="outline" size="sm" onClick={addPlayer}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Player
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {players.map((player, index) => (
                  <div key={index} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Player {index + 1}</p>
                      {players.length > 1 && (
                        <Button type="button" size="icon" variant="ghost" onClick={() => removePlayer(index)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Full Name"
                      value={player.fullName}
                      onChange={(e) => handlePlayerChange(index, "fullName", e.target.value)}
                      required
                    />
                    <Input
                      placeholder="In-Game Name / ID"
                      value={player.ign}
                      onChange={(e) => handlePlayerChange(index, "ign", e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Player Email"
                      type="email"
                      value={player.email}
                      onChange={(e) => handlePlayerChange(index, "email", e.target.value)}
                    />
                    <Input
                      placeholder="Role (optional)"
                      value={player.role}
                      onChange={(e) => handlePlayerChange(index, "role", e.target.value)}
                    />
                  </div>
                ))}
              </div>
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
