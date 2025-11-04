"use client"

import { Calendar } from "@/components/ui/calendar"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { OrganizerSidebar } from "@/components/organizer-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { CalendarIcon, Save, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth"
import { createTournament, uploadTournamentImage, updateTournament } from "@/lib/tournament-service"
import ImageUpload from "@/components/image-upload"

export default function CreateTournamentPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [bannerImage, setBannerImage] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    game: "",
    format: "",
    description: "",
    rules: "",
    totalSlots: 16,
    prizePool: "",
    registrationType: "",
    venue: "",
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to create a tournament.",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [user, isLoading, router, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (file) => {
    setBannerImage(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to create a tournament.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.title || !formData.game || !startDate || !formData.totalSlots) {
      toast({
        title: "Missing required fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Format dates for storage
      const formattedStartDate = startDate ? format(startDate, "yyyy-MM-dd") : null
      const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd") : null

      // Create tournament data
      const tournamentData = {
        ...formData,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        totalSlots: Number.parseInt(formData.totalSlots),
        organizerName: user.name || user.email.split("@")[0],
        image: null, // Will update after upload
      }

      // Create tournament
      const tournament = await createTournament(tournamentData, user.id)

      // Upload banner image if provided
      if (bannerImage) {
        try {
          const imageUrl = await uploadTournamentImage(bannerImage)

          // Update tournament with image URL
          await updateTournament(tournament.id, { image: imageUrl })
        } catch (imageError) {
          console.error("Error uploading image:", imageError)
          // Continue without image if upload fails
          toast({
            title: "Image upload failed",
            description: "Tournament created successfully, but image upload failed.",
            variant: "warning",
          })
        }
      }

      toast({
        title: "Tournament Created",
        description: "Your tournament has been created successfully.",
      })

      router.push("/organizer/dashboard")
    } catch (error) {
      console.error("Error creating tournament:", error)
      toast({
        title: "Error",
        description: "There was an error creating your tournament. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
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

          <main className="flex-1 p-6 mx-auto w-full max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Create Tournament</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Provide the basic details about your tournament.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Tournament Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g., PUBG Mobile Championship"
                        value={formData.title}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="game">
                        Game <span className="text-red-500">*</span>
                      </Label>
                      <Select onValueChange={(value) => handleSelectChange("game", value)} value={formData.game}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a game" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBG Mobile">PUBG Mobile</SelectItem>
                          <SelectItem value="Valorant">Valorant</SelectItem>
                          <SelectItem value="Counter-Strike">Counter-Strike</SelectItem>
                          <SelectItem value="FIFA">FIFA</SelectItem>
                          <SelectItem value="League of Legends">League of Legends</SelectItem>
                          <SelectItem value="Dota 2">Dota 2</SelectItem>
                          <SelectItem value="Fortnite">Fortnite</SelectItem>
                          <SelectItem value="Rocket League">Rocket League</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner">Tournament Banner</Label>
                    <ImageUpload onImageChange={handleImageChange} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>
                        Start Date <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Tournament Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Provide a detailed description of your tournament"
                      rows={5}
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tournament Settings</CardTitle>
                  <CardDescription>
                    Configure the format, rules, and other settings for your tournament.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="format">Tournament Format</Label>
                      <Select onValueChange={(value) => handleSelectChange("format", value)} value={formData.format}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single Elimination">Single Elimination</SelectItem>
                          <SelectItem value="Double Elimination">Double Elimination</SelectItem>
                          <SelectItem value="Round Robin">Round Robin</SelectItem>
                          <SelectItem value="Swiss">Swiss</SelectItem>
                          <SelectItem value="Group Stage + Playoffs">Group Stage + Playoffs</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalSlots">
                        Number of Slots <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="totalSlots"
                        name="totalSlots"
                        type="number"
                        min="2"
                        placeholder="e.g., 16, 32, 64"
                        value={formData.totalSlots}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="prizePool">Prize Pool</Label>
                      <Input
                        id="prizePool"
                        name="prizePool"
                        placeholder="e.g., $1,000"
                        value={formData.prizePool}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationType">Registration Type</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("registrationType", value)}
                        value={formData.registrationType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select registration type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Free">Free Entry</SelectItem>
                          <SelectItem value="Paid">Paid Entry</SelectItem>
                          <SelectItem value="Invite">Invite Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue</Label>
                      <Input
                        id="venue"
                        name="venue"
                        placeholder="e.g., Online, Arena Stadium"
                        value={formData.venue}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rules">Tournament Rules</Label>
                    <Textarea
                      id="rules"
                      name="rules"
                      placeholder="List the rules for your tournament"
                      rows={5}
                      value={formData.rules}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      {/* <Save className="h-2 w-4" /> */}
                      Create Tournament
                    </>
                  )}
                </Button>
              </div>
            </form>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}