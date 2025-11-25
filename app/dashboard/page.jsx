"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { getUserRegistrationsWithDetails } from "@/lib/user-service"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, Calendar, Trophy, Eye, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ParticipantDashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [registrations, setRegistrations] = useState([])

  useEffect(() => {
    const fetchUserRegistrations = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const data = await getUserRegistrationsWithDetails(user.id)
        setRegistrations(data)
      } catch (error) {
        console.error("Error fetching registrations:", error)
        toast({
          title: "Error",
          description: "Failed to load your registrations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRegistrations()
  }, [user, router, toast])

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

  const getTournamentStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      case "upcoming":
      default:
        return <Badge variant="outline">Upcoming</Badge>
    }
  }

  const filterRegistrationsByStatus = (status) => {
    if (status === "all") return registrations
    return registrations.filter((reg) => reg.status === status)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Participant Dashboard</h1>
              <p className="text-muted-foreground">Manage your tournament registrations and teams</p>
            </div>
            <Link href="/tournaments">
              <Button>
                <Trophy className="mr-2 h-4 w-4" />
                Browse Tournaments
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrations.length}</div>
                <p className="text-xs text-muted-foreground">Tournaments you've registered for</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Approved Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {registrations.filter((reg) => reg.status === "approved").length}
                </div>
                <p className="text-xs text-muted-foreground">Ready to participate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {registrations.filter((reg) => reg.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting organizer approval</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Registrations</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            {["all", "approved", "pending", "rejected"].map((status) => (
              <TabsContent key={status} value={status} className="space-y-4">
                {filterRegistrationsByStatus(status).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No {status !== "all" ? status : ""} registrations found.</p>
                      {status === "all" && (
                        <Link href="/tournaments" className="mt-4">
                          <Button>Browse Tournaments</Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {filterRegistrationsByStatus(status).map((registration) => (
                      <Card key={registration.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="relative aspect-video w-full md:w-1/4 overflow-hidden rounded-md">
                              <Image
                                src={registration.tournament?.image || "/placeholder.svg?height=200&width=400"}
                                alt={registration.tournament?.title || "Tournament"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                  <h3 className="text-xl font-bold">
                                    {registration.tournament?.title || "Unknown Tournament"}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm text-muted-foreground">
                                      {registration.tournament?.game || "Unknown Game"}
                                    </p>
                                    {registration.tournament?.status &&
                                      getTournamentStatusBadge(registration.tournament.status)}
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <p className="text-sm mr-2">Registration Status:</p>
                                  {getStatusBadge(registration.status)}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                  <p className="text-sm font-medium">Team Name</p>
                                  <p className="text-sm text-muted-foreground">{registration.teamName}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Team Size</p>
                                  <p className="text-sm text-muted-foreground">{registration.teamSize} players</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Registration Date</p>
                                  <p className="text-sm text-muted-foreground">
                                    {registration.createdAt?.toDate
                                      ? new Date(registration.createdAt.toDate()).toLocaleDateString()
                                      : new Date(registration.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Tournament Date</p>
                                  <p className="text-sm text-muted-foreground">
                                    {registration.tournament?.startDate || "TBD"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-4">
                                <Link href={`/tournaments/${registration.tournamentId}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="mr-1 h-4 w-4" />
                                    View Tournament
                                  </Button>
                                </Link>
                                {registration.status === "approved" && (
                                  <Button size="sm">
                                    <Calendar className="mr-1 h-4 w-4" />
                                    View Schedule
                                  </Button>
                                )}
                              </div>

                              {registration.status === "rejected" && (
                                <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                                  <p className="text-sm font-medium text-destructive">Registration Rejected</p>
                                  <p className="text-sm text-muted-foreground">
                                    Your registration was not approved by the tournament organizer.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
