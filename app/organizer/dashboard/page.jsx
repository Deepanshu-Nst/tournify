"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizerTournamentList } from "@/components/organizer-tournament-list"
import { OrganizerSidebar } from "@/components/organizer-sidebar"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getOrganizerTournaments, getTournamentRegistrations } from "@/lib/tournament-service"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function OrganizerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalTournaments: 0,
    activeParticipants: 0,
    pendingApprovals: 0,
    tournaments: [],
    registrations: [],
  })

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to access the organizer dashboard.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Skip data fetching if still authenticating
    if (authLoading) return

    const fetchDashboardData = async () => {
      try {
        // Get organizer tournaments
        const tournaments = await getOrganizerTournaments(user.id)

        // Calculate stats
        const totalTournaments = tournaments.length
        let activeParticipants = 0
        let pendingApprovals = 0
        let allRegistrations = []

        // Get registrations for each tournament
        for (const tournament of tournaments) {
          const registrations = await getTournamentRegistrations(tournament.id)
          allRegistrations = [...allRegistrations, ...registrations]

          // Count pending approvals
          pendingApprovals += registrations.filter((reg) => reg.status === "pending").length

          // Count active participants (approved registrations)
          activeParticipants += registrations.filter((reg) => reg.status === "approved").length
        }

        setDashboardData({
          totalTournaments,
          activeParticipants,
          pendingApprovals,
          tournaments,
          registrations: allRegistrations,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, router, toast, authLoading])

  // Memoize filtered registrations for better performance
  const pendingRegistrations = useMemo(() => {
    return dashboardData.registrations.filter((reg) => reg.status === "pending")
  }, [dashboardData.registrations])

  // Loading skeleton for the dashboard
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 bg-muted/40">
          <div className="flex">
            <OrganizerSidebar />
            <main className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-40" />
              </div>

              <div className="grid gap-6 md:grid-cols-3 mb-6">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-[400px] w-full rounded-md" />
            </main>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1 bg-muted/40">
        <div className="flex">
          <OrganizerSidebar />

          <main className="flex-1 p-6 mx-auto w-full max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
              <Link href="/organizer/tournaments/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Tournament
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalTournaments}</div>
                  <p className="text-xs text-muted-foreground">Your created tournaments</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.activeParticipants}</div>
                  <p className="text-xs text-muted-foreground">Registered participants</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.pendingApprovals}</div>
                  <p className="text-xs text-muted-foreground">Requiring your attention</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="tournaments" className="space-y-4">
              <TabsList>
                <TabsTrigger value="tournaments">My Tournaments</TabsTrigger>
                <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
                <TabsTrigger value="queries">Participant Queries</TabsTrigger>
              </TabsList>
              <TabsContent value="tournaments" className="space-y-4">
                <OrganizerTournamentList tournaments={dashboardData.tournaments} />
              </TabsContent>
              <TabsContent value="approvals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>
                      Review and approve participant registrations for your tournaments.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="p-4">
                        {pendingRegistrations.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-muted-foreground">No pending approvals at the moment.</p>
                          </div>
                        ) : (
                          <div className="grid gap-6">
                            {pendingRegistrations.map((registration) => (
                              <div
                                key={registration.id}
                                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                              >
                                <div>
                                  <h3 className="font-medium">{registration.teamName}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    For:{" "}
                                    {dashboardData.tournaments.find((t) => t.id === registration.tournamentId)?.title ||
                                      "Unknown Tournament"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Submitted: {new Date(registration.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                  <Button variant="destructive" size="sm">
                                    Reject
                                  </Button>
                                  <Button size="sm">Approve</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="queries" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Participant Queries</CardTitle>
                    <CardDescription>Respond to questions and queries from participants.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="p-4">
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No queries at the moment.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
