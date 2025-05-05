"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Trophy, Menu, Calendar, Home, Users, LogIn, User } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { UserButton } from "@/components/user-button"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Tournaments", href: "/tournaments", icon: Trophy },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "About", href: "/about", icon: Users },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="mr-2" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 pt-16">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Trophy className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">Tournify</span>
                </Link>
                <div className="flex flex-col gap-2">
                  {navigation.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <ItemIcon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="hidden font-bold md:inline-block text-xl">Tournify</span>
          </Link>

          <nav className="hidden lg:flex lg:items-center lg:gap-6 ml-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-1 py-2 text-sm font-medium ${
                  pathname === item.href ? "text-primary" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {user ? (
            <>
              <Link href="/organizer/dashboard">
                <Button variant="outline" size="sm">
                  Organizer Panel
                </Button>
              </Link>
              <UserButton>
                <DropdownMenuItem asChild>
                  <a href="/dashboard" className="cursor-pointer flex w-full items-center">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>My Tournaments</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/profile" className="cursor-pointer flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </a>
                </DropdownMenuItem>
              </UserButton>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={() => router.push("/login")}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
