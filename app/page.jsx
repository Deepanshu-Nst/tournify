import { Navbar } from "@/components/navbar"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Calendar, Medal, ArrowRight, Globe, Gamepad2, BusIcon as SoccerBall } from "lucide-react"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pb-20 pt-12 md:pt-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Tournament background"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>

        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Organize & Compete <span className="text-primary">Like Never Before</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Tournify connects organizers and participants in one seamless platform. Create, manage, and join
                  tournaments with ease.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/tournaments">
                  <Button size="lg" className="gap-1.5">
                    Explore Tournaments
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/organizer/dashboard">
                  <Button size="lg" variant="outline">
                    Organize Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm flex flex-col justify-center">
              <div className="mb-4 flex justify-center">
                <Trophy className="h-16 w-16 text-primary" />
              </div>
              <h3 className="mb-2 text-center text-2xl font-bold">Featured Tournament</h3>
              <div className="rounded-md border p-4">
                <div className="flex items-center gap-4">
                  <SoccerBall className="h-12 w-12 text-primary" />
                  <div>
                    <h4 className="font-bold">Premier League Cup 2025</h4>
                    <p className="text-sm text-muted-foreground">Registration ends in 3 days</p>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <Users className="mr-1 h-3 w-3" />
                      <span>87/128 teams registered</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="secondary">
                    View Details
                  </Button>
                  <Button size="sm">Register Now</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything You Need to Run Successful Tournaments
            </h2>
            <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              From registration to results, Tournify handles it all so you can focus on what matters.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <Trophy className="mb-3 h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Tournament Creation</h3>
              <p className="text-muted-foreground">Create tournaments with custom formats, rules, and brackets.</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <Users className="mb-3 h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Team Management</h3>
              <p className="text-muted-foreground">Manage participants, approvals, and communication in one place.</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <Gamepad2 className="mb-3 h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Multiple Games</h3>
              <p className="text-muted-foreground">Support for both esports and traditional sports tournaments.</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <Calendar className="mb-3 h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Scheduling</h3>
              <p className="text-muted-foreground">Set up schedules, match times, and automated notifications.</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <Medal className="mb-3 h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Results & Statistics</h3>
              <p className="text-muted-foreground">Track results, standings, and player statistics.</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <Globe className="mb-3 h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Global Reach</h3>
              <p className="text-muted-foreground">Connect with participants from around the world.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/40 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
            <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of organizers and participants already using Tournify.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg">Sign Up Now</Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
