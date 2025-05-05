import Link from "next/link"
import { Trophy } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container px-4 py-12 md:px-6 md:py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Tournify</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The ultimate platform for sports & esports tournament management. Connect organizers with participants and
              create amazing competitions.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Made by Deepanshu Chaudhary</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-3 lg:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-wide">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/tournaments" className="text-sm hover:text-primary transition-colors">
                    Tournaments
                  </Link>
                </li>
                <li>
                  <Link href="/organizer/dashboard" className="text-sm hover:text-primary transition-colors">
                    Organizer Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-wide">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-sm hover:text-primary transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-wide">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-sm hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-sm hover:text-primary transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Tournify. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link
                href="https://twitter.com"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Twitter
              </Link>
              <Link
                href="https://facebook.com"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Facebook
              </Link>
              <Link
                href="https://instagram.com"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Instagram
              </Link>
              <Link
                href="https://discord.com"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Discord
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
