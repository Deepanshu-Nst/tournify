"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getAllTournaments } from "@/lib/tournament-service"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { TournamentInitializer } from "@/components/tournament-initializer"

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        // Show loading state immediately
        setIsLoading(true)

        // Fetch tournaments
        const data = await getAllTournaments()

        // Add a small delay to ensure smooth animation
        setTimeout(() => {
          setTournaments(data)
          setIsLoading(false)
        }, 300)
      } catch (error) {
        console.error("Error fetching tournaments:", error)
        toast({
          title: "Error",
          description: "Failed to load tournaments. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchTournaments()
  }, [toast])

  // Filter tournaments based on search query - use useMemo for performance
  const filteredTournaments = useMemo(() => {
    if (searchQuery.trim() === "") {
      return tournaments
    }

    return tournaments.filter(
      (tournament) =>
        tournament.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tournament.game?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery, tournaments])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Filter by status - use useMemo for performance
  const upcomingTournaments = useMemo(
    () => filteredTournaments.filter((t) => t.status === "upcoming"),
    [filteredTournaments],
  )

  const activeTournaments = useMemo(
    () => filteredTournaments.filter((t) => t.status === "active"),
    [filteredTournaments],
  )

  const completedTournaments = useMemo(
    () => filteredTournaments.filter((t) => t.status === "completed"),
    [filteredTournaments],
  )

  // Tournament card component to reduce repetition
  const TournamentCard = ({ tournament, index }) => (
    <Link href={`/tournaments/${tournament.id}`} key={tournament.id}>
      <Card
        className="overflow-hidden h-full tournament-card hover:shadow-md transition-all hover-lift animate-fade-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="relative aspect-video">
          <Image
            src={tournament.image || "/placeholder.svg?height=200&width=400"}
            alt={tournament.title}
            fill
            className="object-cover"
          />
          {/* <Badge className="absolute top-2 right-2">{tournament.registrationType || "Free"}</Badge> */}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-xl mb-2">{tournament.title}</h3>
          <p className="text-sm text-muted-foreground">{tournament.game}</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tournament.startDate}</span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {tournament.registeredTeams || 0}/{tournament.totalSlots} teams registered
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <Button variant="default" size="sm"
          //  className="w-full transition-all hover:bg-primary/90"
           >
            {tournament.status === "completed" ? "View Results" : "View Details"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )

  // Skeleton loader for tournament cards
  const TournamentCardSkeleton = ({ index }) => (
    <Card className="overflow-hidden h-full animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="relative aspect-video bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <TournamentInitializer />
      <Navbar />

      <main className="flex-1">
        <section className="border-b bg-muted/40 py-12 animate-fade-in">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="animate-slide-up">
                <h1 className="text-3xl font-bold tracking-tight">Tournaments</h1>
                <p className="mt-1 text-muted-foreground">Find and join tournaments from around the world</p>
              </div>

              {/* // search bar */}
              
              <div className="flex items-center gap-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search tournaments..."
                    className="pl-8 w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="upcoming" className="space-y-8">
              <div className="flex justify-between items-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </div>

              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <TournamentCardSkeleton key={index} index={index} />
                    ))}
                </div>
              ) : (
                <>
                  <TabsContent value="upcoming" className="space-y-4">
                    {upcomingTournaments.length === 0 ? (
                      <div className="text-center py-10 animate-fade-in">
                        <p className="text-muted-foreground">No upcoming tournaments found.</p>
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {upcomingTournaments.map((tournament, index) => (
                          <TournamentCard key={tournament.id} tournament={tournament} index={index} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="active" className="space-y-4">
                    {activeTournaments.length === 0 ? (
                      <div className="text-center py-10 animate-fade-in">
                        <p className="text-muted-foreground">No active tournaments found.</p>
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {activeTournaments.map((tournament, index) => (
                          <TournamentCard key={tournament.id} tournament={tournament} index={index} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-4">
                    {completedTournaments.length === 0 ? (
                      <div className="text-center py-10 animate-fade-in">
                        <p className="text-muted-foreground">No completed tournaments found.</p>
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {completedTournaments.map((tournament, index) => (
                          <TournamentCard key={tournament.id} tournament={tournament} index={index} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}