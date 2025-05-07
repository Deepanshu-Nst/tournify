import { Navbar } from "@/components/navbar"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Calendar, Medal, ArrowRight, Globe, Gamepad2, BusIcon as SoccerBall } from "lucide-react"
import Footer from "@/components/footer"
import { TournamentInitializer } from "@/components/tournament-initializer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TournamentInitializer />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pb-20 pt-12 md:pt-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          <Image
            src="https://files.oaiusercontent.com/file-6gg5mo3zJgMdWWqqKG4rXr?se=2025-05-07T11%3A14%3A02Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D299%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D9470c89f-9d9e-4ad0-8609-9befa504c2a1.png&sig=qAC2b6VLiEkukBBDBeQLmUNeD0aquFeC8UyIkBY%2BpNg%3D"
            alt="Tournament background"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>

        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
            <div className="flex flex-col justify-center space-y-4 animate-slide-up">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none hero-text">
                  <span>Organize</span> & <span>Compete</span> <span className="gradient-text">Like Never Before</span>
                </h1>
                <p
                  className="max-w-[600px] text-muted-foreground md:text-xl animate-fade-in"
                  style={{ animationDelay: "0.4s" }}
                >
                  Tournify connects organizers and participants in one seamless platform. Create, manage, and join
                  tournaments with ease.
                </p>
              </div>
              <div
                className="flex flex-col gap-2 min-[400px]:flex-row animate-fade-in"
                style={{ animationDelay: "0.6s" }}
              >
                <Link href="/tournaments">
                  <Button size="sm" className="gap-1.5 transition-all hover:bg-primary/90 hover:translate-y-[-2px]">
                    Explore Tournaments
                    {/* <ArrowRight className="h-4 w-4" /> */}
                  </Button>
                </Link>
                <Link href="/organizer/dashboard">
                  <Button
                    size="sm"
                    variant="outline"
                    className="transition-all hover:bg-secondary/80 hover:translate-y-[-2px]"
                  >
                    Organize Now
                  </Button>
                </Link>
              </div>
            </div>
            <div
              className="rounded-lg border glass-card p-6 shadow-lg flex flex-col justify-center animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="mb-4 flex justify-center">
                <Trophy className="h-16 w-16 text-primary animate-bounce trophy-icon" />
              </div>
              <h3 className="mb-2 text-center text-2xl font-bold">Featured Tournament</h3>
              <div className="rounded-md border p-4 transition-all hover:border-primary hover:shadow-md enhanced-card">
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
                  <Button size="sm" variant="secondary" className="transition-all hover:bg-secondary/80">
                    View Details
                  </Button>
                  <Button size="sm" className="transition-all hover:bg-primary/90">
                    Register Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything You Need to Run Successful Tournaments
            </h2>
            <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              From registration to results, Tournify handles it all so you can focus on what matters.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Trophy,
                title: "Tournament Creation",
                desc: "Create tournaments with custom formats, rules, and brackets.",
              },
              {
                icon: Users,
                title: "Team Management",
                desc: "Manage participants, approvals, and communication in one place.",
              },
              {
                icon: Gamepad2,
                title: "Multiple Games",
                desc: "Support for both esports and traditional sports tournaments.",
              },
              {
                icon: Calendar,
                title: "Scheduling",
                desc: "Set up schedules, match times, and automated notifications.",
              },
              { icon: Medal, title: "Results & Statistics", desc: "Track results, standings, and player statistics." },
              { icon: Globe, title: "Global Reach", desc: "Connect with participants from around the world." },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-lg border enhanced-card p-6 transition-all hover:border-primary hover:shadow-md animate-fade-in hover-scale"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <feature.icon className="mb-3 h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}