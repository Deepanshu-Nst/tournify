"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Trophy,
  Users,
  Info,
  Clock,
  MapPin,
  DollarSign,
  Shield,
  Loader2,
  WifiOff,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import TournamentRegistrationForm from "@/components/tournament-registration-form"
import { getTournamentById } from "@/lib/tournament-service"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function TournamentDetailPage({ params }) {
  const [tournament, setTournament] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const fetchTournament = async () => {
    setIsLoading(true)
    setIsOffline(false)

    try {
      const data = await getTournamentById(params.id)
      setTournament(data)
    } catch (error) {
      console.error("Error fetching tournament:", error)

      // Check if it's an offline error
      if (error.message?.includes("offline") || error.message?.includes("internet connection")) {
        setIsOffline(true)
        toast({
          title: "You're offline",
          description: "Unable to load tournament details. Please check your internet connection.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load tournament details. Please try again.",
          variant: "destructive",
        })
        router.push("/tournaments")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTournament()

    // Add online/offline event listeners
    const handleOnline = () => {
      if (isOffline) {
        toast({
          title: "You're back online",
          description: "Reconnecting to the server...",
        })
        fetchTournament()
      }
    }

    const handleOffline = () => {
      setIsOffline(true)
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
  }, [params.id, toast, router, isOffline])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading tournament details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isOffline) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <WifiOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold">You're offline</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Unable to load tournament details. Please check your internet connection and try again.
            </p>
            <Button className="mt-6" onClick={fetchTournament}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Tournament not found</h2>
            <p className="text-muted-foreground mt-2">
              The tournament you're looking for doesn't exist or has been removed.
            </p>
            <Button className="mt-4" onClick={() => router.push("/tournaments")}>
              Back to Tournaments
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Parse rules if they're stored as a string
  const rules =
    typeof tournament.rules === "string" ? tournament.rules.split("\n").filter((rule) => rule.trim() !== "") : []

  // Create mock schedule based on start and end dates
  const schedule = [
    { round: "Registration Deadline", date: tournament.startDate, time: "23:59 GMT" },
    { round: "Group Stage", date: tournament.startDate, time: "18:00 GMT" },
    { round: "Finals", date: tournament.endDate || tournament.startDate, time: "19:00 GMT" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Tournament Banner */}
        <div className="relative aspect-[3/1] w-full overflow-hidden">
          <Image
            src={tournament.image || "/placeholder.svg?height=400&width=1200"}
            alt={tournament.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <Badge className="mb-2">{tournament.game}</Badge>
            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">{tournament.title}</h1>
            <p className="mt-2 text-muted-foreground">
              Organized by {tournament.organizerName || "Tournament Organizer"}
            </p>
          </div>
        </div>

        {/* Tournament Info */}
        <section className="py-8">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="rules">Rules</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="brackets">Brackets</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tournament Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p>{tournament.description || "No description provided."}</p>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Start Date</p>
                              <p className="text-sm text-muted-foreground">{tournament.startDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">End Date</p>
                              <p className="text-sm text-muted-foreground">{tournament.endDate || "TBD"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Prize Pool</p>
                              <p className="text-sm text-muted-foreground">{tournament.prizePool || "Not specified"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Format</p>
                              <p className="text-sm text-muted-foreground">{tournament.format || "Not specified"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Venue</p>
                              <p className="text-sm text-muted-foreground">{tournament.venue || "Online"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Registration Type</p>
                              <p className="text-sm text-muted-foreground">{tournament.registrationType || "Free"}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Organizer Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <Image
                            src="/placeholder.svg?height=100&width=100"
                            alt="Organizer"
                            width={70}
                            height={70}
                            className="rounded-full"
                          />
                          <div>
                            <h3 className="font-bold">{tournament.organizerName || "Tournament Organizer"}</h3>
                            <p className="text-sm text-muted-foreground">Verified Tournament Organizer</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="rules" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tournament Rules</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {rules.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-2">
                            {rules.map((rule, index) => (
                              <li key={index} className="text-muted-foreground">
                                {rule}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">
                            No specific rules have been provided for this tournament.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="schedule" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tournament Schedule</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {schedule.map((item, index) => (
                            <div key={index} className="flex items-center border-b pb-4 last:border-0 last:pb-0">
                              <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <Calendar className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{item.round}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {item.date} • {item.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="brackets" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tournament Brackets</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center">
                            <Info className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">Brackets Not Available Yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Brackets will be available once the tournament begins.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="results" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tournament Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center">
                            <Info className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">Results Not Available Yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Results will be posted as matches are completed.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Registration Sidebar */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between pb-4 border-b">
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">Slots</span>
                      </div>
                      <span className="text-sm">
                        {tournament.registeredTeams}/{tournament.totalSlots}
                      </span>
                    </div>

                    <div className="flex justify-between pb-4 border-b">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">Registration Closes</span>
                      </div>
                      <span className="text-sm">{tournament.startDate}</span>
                    </div>

                    <div className="w-full">
                      <TournamentRegistrationForm
                        tournamentId={params.id}
                        registrationType={tournament.registrationType}
                        tournamentName={tournament.title}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
