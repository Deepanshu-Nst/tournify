import { Inter } from "next/font/google"
import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"

import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth"
import { NetworkStatus } from "@/components/network-status"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Tournify | Sports & Esports Tournament Management",
  description: "Create, manage, and participate in sports and esports tournaments with ease.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
            <NetworkStatus />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
