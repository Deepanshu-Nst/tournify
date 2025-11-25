"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Eye, Edit, Users, Trash, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getOrganizerTournaments, deleteTournament } from "@/lib/tournament-service"
import { useToast } from "@/hooks/use-toast"
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

export function OrganizerTournamentList() {
  const [tournaments, setTournaments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tournamentToDelete, setTournamentToDelete] = useState(null)
  const { user, token } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchTournaments = async () => {
      if (!user) return

      try {
        const data = await getOrganizerTournaments(user.id)
        setTournaments(data)
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
  }, [user, toast])

  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="outline">Upcoming</Badge>
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDeleteClick = (tournament) => {
    setTournamentToDelete(tournament)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!tournamentToDelete) return

    try {
      await deleteTournament(tournamentToDelete.id, token)
      setTournaments(tournaments.filter((t) => t.id !== tournamentToDelete.id))
      toast({
        title: "Tournament deleted",
        description: "The tournament has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting tournament:", error)
      toast({
        title: "Error",
        description: "Failed to delete tournament. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setTournamentToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Tournaments</CardTitle>
          <CardDescription>Manage your created tournaments and events.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading tournaments...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tournaments</CardTitle>
        <CardDescription>Manage your created tournaments and events.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="p-4">
            {tournaments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">You haven't created any tournaments yet.</p>
                <Link href="/organizer/tournaments/create">
                  <Button className="mt-4">Create Your First Tournament</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {tournaments.map((tournament) => {
                  const isOwner = user && tournament.organizerId === user.id
                  return (
                  <div
                    key={tournament.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-32 overflow-hidden rounded-md">
                        <Image
                          src={tournament.image || "/placeholder.svg?height=100&width=200"}
                          alt={tournament.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{tournament.title}</h3>
                          {getStatusBadge(tournament.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{tournament.game}</p>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <Users className="mr-1 h-3 w-3" />
                          <span>
                            {tournament.registeredTeams}/{tournament.totalSlots} teams
                          </span>
                          <span className="mx-2">•</span>
                          <span>Starts: {tournament.startDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/tournaments/${tournament.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      {isOwner && (
                        <>
                          <Link href={`/organizer/tournaments/${tournament.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(tournament)}>
                            <Trash className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tournament and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
