"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { getTournamentById } from "@/lib/tournament-service"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function RegistrationSuccessPage({ params }) {
  const [tournament, setTournament] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const data = await getTournamentById(params.id)
        setTournament(data)
      } catch (error) {
        console.error("Error fetching tournament:", error)
        toast({
          title: "Error",
          description: "Failed to load tournament details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTournament()
  }, [params.id, toast])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Registration Successful!</CardTitle>
            <CardDescription>
              Your registration for {tournament?.title || "the tournament"} has been completed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <p className="text-center">
                We've sent a confirmation email with all the details. Please check your inbox.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Next Steps:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Join our Discord server for tournament updates</li>
                <li>Check your email for team verification instructions</li>
                <li>Review the tournament schedule and rules</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href={`/tournaments/${params.id}`} className="w-full">
              <Button className="w-full">Return to Tournament</Button>
            </Link>
            <Link href="/tournaments" className="w-full">
              <Button variant="outline" className="w-full">
                Browse More Tournaments
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
