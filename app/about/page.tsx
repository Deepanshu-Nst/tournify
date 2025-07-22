import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Clock, Globe, Shield, HeadphonesIcon } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">About Tournify</h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Tournify bridges the gap between tournament organizers and participants with a powerful, yet simple
                    platform.
                  </p>
                </div>
                <p className="max-w-[600px] text-muted-foreground">
                  Our mission is to make tournament management accessible to everyone, from local community events to
                  large-scale esports competitions. We provide organizers with the tools they need to create and manage
                  successful tournaments, while offering participants a seamless experience to find, join, and compete
                  in events that matter to them.
                </p>
              </div>
              <div className="mx-auto aspect-square overflow-hidden rounded-xl object-cover">
                <Image
                  src="https://i.imghippo.com/files/pV8928mCU.png"
                  alt="The Tournify Team"
                  width={600}
                  height={600}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-muted/40 py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-[58rem] gap-6 text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Values</h2>
              <p className="text-muted-foreground md:text-xl/relaxed">
                The core principles that guide everything we do at Tournify.
              </p>
            </div>
            <div className="mx-auto grid gap-8 pt-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Excellence</h3>
                <p className="text-center text-muted-foreground">
                  We're committed to providing the best tournament management experience for organizers and
                  participants.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Community</h3>
                <p className="text-center text-muted-foreground">
                  We believe in the power of bringing people together through competition and shared interests.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Efficiency</h3>
                <p className="text-center text-muted-foreground">
                  Our platform is designed to save time and reduce complexity for tournament organizers.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Inclusivity</h3>
                <p className="text-center text-muted-foreground">
                  We're building a platform that's accessible to everyone, regardless of location or experience level.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Integrity</h3>
                <p className="text-center text-muted-foreground">
                  We uphold fair play and transparency in all aspects of our platform and business.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <HeadphonesIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Support</h3>
                <p className="text-center text-muted-foreground">
                  We're dedicated to providing exceptional support to all users of our platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
 

      </main>

      <Footer />
    </div>
  )
}