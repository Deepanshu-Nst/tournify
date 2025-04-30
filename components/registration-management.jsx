"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getTournamentRegistrations, updateRegistrationStatus } from "@/lib/tournament-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export function RegistrationManagement({ tournamentId }) {
  const [registrations, setRegistrations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [showDialog, setShowDialog] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const data = await getTournamentRegistrations(tournamentId)
        setRegistrations(data)
      } catch (error) {
        console.error("Error fetching registrations:", error)
        toast({
          title: "Error",
          description: "Failed to load registrations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegistrations()
  }, [tournamentId, toast])

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration)
    setShowDialog(true)
  }

  const handleUpdateStatus = async (registrationId, status) => {
    setIsUpdating(true)
    try {
      await updateRegistrationStatus(registrationId, status)

      // Update local state
      setRegistrations(registrations.map((reg) => (reg.id === registrationId ? { ...reg, status } : reg)))

      toast({
        title: `Registration ${status === "approved" ? "Approved" : "Rejected"}`,
        description: `The registration has been ${status === "approved" ? "approved" : "rejected"} successfully.`,
      })

      setShowDialog(false)
    } catch (error) {
      console.error("Error updating registration status:", error)
      toast({
        title: "Error",
        description: "Failed to update registration status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "pending":
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading registrations...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tournament Registrations</CardTitle>
          <CardDescription>Manage participant registrations for this tournament.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4">
              {registrations.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No registrations yet.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {registrations.map((registration) => (
                    <div
                      key={registration.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{registration.teamName}</h3>
                          {getStatusBadge(registration.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">Team Size: {registration.teamSize} players</p>
                        <p className="text-sm text-muted-foreground">Contact: {registration.contactEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(registration.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(registration)}>
                          <Eye className="mr-1 h-4 w-4" />
                          View Details
                        </Button>
                        {registration.status === "pending" && (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUpdateStatus(registration.id, "rejected")}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => handleUpdateStatus(registration.id, "approved")}>
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedRegistration && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registration Details</DialogTitle>
              <DialogDescription>Review the details of this registration.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Team Name</p>
                  <p className="text-sm text-muted-foreground">{selectedRegistration.teamName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Team Size</p>
                  <p className="text-sm text-muted-foreground">{selectedRegistration.teamSize} players</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Contact Email</p>
                  <p className="text-sm text-muted-foreground">{selectedRegistration.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Contact Phone</p>
                  <p className="text-sm text-muted-foreground">{selectedRegistration.contactPhone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm">{getStatusBadge(selectedRegistration.status)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Additional Information</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRegistration.additionalInfo || "No additional information provided."}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              {selectedRegistration.status === "pending" ? (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus(selectedRegistration.id, "rejected")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Reject"
                    )}
                  </Button>
                  <Button onClick={() => handleUpdateStatus(selectedRegistration.id, "approved")} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Approve"
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowDialog(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
