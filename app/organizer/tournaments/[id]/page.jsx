"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrganizerSidebar } from "@/components/organizer-sidebar"
import { RegistrationManagement } from "@/components/registration-management"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Edit, Trash, Loader2, WifiOff, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getTournamentById, deleteTournament } from "@/lib/tournament-service"
import Link from "next/link"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TournamentManagementPage({ params }) {
  const [tournament, setTournament] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const fetchTournament = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    setIsOffline(false)

    try {
      const data = await getTournamentById(params.id)

      // Check if user is the organizer
      if (data.organizerId !== user.id) {
        toast({
          title: "Unauthorized",
          description: "You don't have permission to manage this tournament.",
          variant: "destructive",
        })
        router.push("/organizer/dashboard")
        return
      }

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
        router.push("/organizer/dashboard")
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
  }, [params.id, user, router, toast, isOffline])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteTournament(params.id, user.id)
      toast({
        title: "Tournament deleted",
        description: "The tournament has been deleted successfully.",
      })
      router.push("/organizer/dashboard")
    } catch (error) {
      console.error("Error deleting tournament:", error)

      // Check if it's an offline error
      if (error.message?.includes("offline") || error.message?.includes("internet connection")) {
        toast({
          title: "You're offline",
          description: "Unable to delete tournament. Please check your internet connection and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete tournament. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 bg-muted/40 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading tournament details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (isOffline) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 bg-muted/40 flex justify-center items-center">
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
        </div>
        <Footer />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 bg-muted/40 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Tournament not found</h2>
            <p className="text-muted-foreground mt-2">
              The tournament you're looking for doesn't exist or has been removed.
            </p>
            <Button className="mt-4" onClick={() => router.push("/organizer/dashboard")}>
              Back to Dashboard
            </Button>
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

          <main className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Manage Tournament</h1>
              <div className="flex gap-2">
                <Link href={`/organizer/tournaments/${params.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Tournament
                  </Button>
                </Link>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Tournament
                </Button>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative aspect-video w-full md:w-1/3 overflow-hidden rounded-md">
                    <Image
                      src={tournament.image || "/placeholder.svg?height=200&width=400"}
                      alt={tournament.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{tournament.title}</h2>
                    <p className="text-muted-foreground">{tournament.game}</p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium">Start Date</p>
                        <p className="text-sm text-muted-foreground">{tournament.startDate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">End Date</p>
                        <p className="text-sm text-muted-foreground">{tournament.endDate || "TBD"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Registration</p>
                        <p className="text-sm text-muted-foreground">
                          {tournament.registeredTeams}/{tournament.totalSlots} teams
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-sm text-muted-foreground capitalize">{tournament.status}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href={`/tournaments/${params.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          View Public Page
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="registrations" className="space-y-4">
              <TabsList>
                <TabsTrigger value="registrations">Registrations</TabsTrigger>
                <TabsTrigger value="brackets">Brackets</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
              </TabsList>

              <TabsContent value="registrations">
                <RegistrationManagement tournamentId={params.id} />
              </TabsContent>

              <TabsContent value="brackets">
                <Card>
                  <CardHeader>
                    <CardTitle>Tournament Brackets</CardTitle>
                    <CardDescription>Create and manage tournament brackets.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Bracket management will be available soon.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results">
                <Card>
                  <CardHeader>
                    <CardTitle>Tournament Results</CardTitle>
                    <CardDescription>Manage and publish tournament results.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Results management will be available soon.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="announcements">
                <Card>
                  <CardHeader>
                    <CardTitle>Tournament Announcements</CardTitle>
                    <CardDescription>Create and manage announcements for participants.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">Announcement management will be available soon.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <Footer />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tournament and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
