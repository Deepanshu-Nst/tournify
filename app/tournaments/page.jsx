"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getAllTournaments } from "@/lib/tournament-service"
import { useToast } from "@/hooks/use-toast"

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [filteredTournaments, setFilteredTournaments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getAllTournaments()
        setTournaments(data)
        setFilteredTournaments(data)
      } catch (error) {
        console.error("Error fetching tournaments:", error)
        toast({
          title: "Error",
          description: "Failed to load tournaments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTournaments()
  }, [toast])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTournaments(tournaments)
    } else {
      const filtered = tournaments.filter(
        (tournament) =>
          tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tournament.game.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredTournaments(filtered)
    }
  }, [searchQuery, tournaments])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const filterByStatus = (status) => {
    return filteredTournaments.filter((t) => t.status === status)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b bg-muted/40 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Tournaments</h1>
                <p className="mt-1 text-muted-foreground">Find and join tournaments from around the world</p>
              </div>
              <div className="flex items-center gap-2">
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
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">Loading tournaments...</p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="upcoming" className="space-y-8">
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="upcoming" className="space-y-4">
                  {filterByStatus("upcoming").length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No upcoming tournaments found.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filterByStatus("upcoming").map((tournament) => (
                        <Link href={`/tournaments/${tournament.id}`} key={tournament.id}>
                          <Card className="overflow-hidden h-full tournament-card">
                            <div className="relative aspect-video">
                              <Image
                                src={tournament.image || "/placeholder.svg?height=200&width=400"}
                                alt={tournament.title}
                                fill
                                className="object-cover"
                              />
                              <Badge className="absolute top-2 right-2">{tournament.registrationType}</Badge>
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
                                    {tournament.registeredTeams}/{tournament.totalSlots} teams registered
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                              <Button variant="default" size="sm" className="w-full">
                                View Details
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                  {filterByStatus("active").length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No active tournaments found.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filterByStatus("active").map((tournament) => (
                        <Link href={`/tournaments/${tournament.id}`} key={tournament.id}>
                          <Card className="overflow-hidden h-full tournament-card">
                            <div className="relative aspect-video">
                              <Image
                                src={tournament.image || "/placeholder.svg?height=200&width=400"}
                                alt={tournament.title}
                                fill
                                className="object-cover"
                              />
                              <Badge className="absolute top-2 right-2">{tournament.registrationType}</Badge>
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
                                    {tournament.registeredTeams}/{tournament.totalSlots} teams registered
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                              <Button variant="default" size="sm" className="w-full">
                                View Details
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  {filterByStatus("completed").length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No completed tournaments found.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filterByStatus("completed").map((tournament) => (
                        <Link href={`/tournaments/${tournament.id}`} key={tournament.id}>
                          <Card className="overflow-hidden h-full tournament-card">
                            <div className="relative aspect-video">
                              <Image
                                src={tournament.image || "/placeholder.svg?height=200&width=400"}
                                alt={tournament.title}
                                fill
                                className="object-cover"
                              />
                              <Badge className="absolute top-2 right-2" variant="outline">
                                {tournament.registrationType}
                              </Badge>
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
                                    {tournament.registeredTeams}/{tournament.totalSlots} teams registered
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex items-center justify-between">
                              <Button variant="outline" size="sm" className="w-full">
                                View Results
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
