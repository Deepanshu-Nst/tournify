"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const { signIn, /* signInWithGoogle, */ isFirebaseInitialized } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [configError, setConfigError] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized) {
      setConfigError(true)
      toast({
        title: "Configuration Error",
        description: "Firebase is not properly configured. Please contact support.",
        variant: "destructive",
      })
    }
  }, [isFirebaseInitialized, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (configError) {
      toast({
        title: "Configuration Error",
        description: "Firebase is not properly configured. Please contact support.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await signIn(formData.email, formData.password)
      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      })
      router.push("/")
    } catch (error) {
      console.error("Login error:", error)

      let errorMessage = error.message || "Invalid email or password."

      if (errorMessage.includes("not found") || errorMessage.includes("No account")) {
        errorMessage = "No account found with this email. Please sign up first."
      } else if (errorMessage.includes("password") || errorMessage.includes("Invalid")) {
        errorMessage = "Invalid email or password. Please try again."
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // const handleGoogleSignIn = async () => {
  //   if (configError) {
  //     toast({
  //       title: "Configuration Error",
  //       description: "Firebase is not properly configured. Please contact support.",
  //       variant: "destructive",
  //     })
  //     return
  //   }
  //   setIsLoading(true)
  //   try {
  //     await signInWithGoogle()
  //     toast({ title: "Login successful", description: "You have been logged in successfully with Google." })
  //     router.push("/")
  //   } catch (error) {
  //     console.error("Google sign-in error:", error)
  //     let errorMessage = "There was an error signing in with Google."
  //     toast({ title: "Login failed", description: errorMessage, variant: "destructive" })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>

          {configError && (
            <div className="px-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                  Firebase authentication is not properly configured. Please check your environment variables or contact
                  support.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={configError || isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={configError || isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={configError || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              {/** Google sign-in temporarily disabled */}
              {/**
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button variant="outline" type="button" disabled={configError || isLoading} onClick={handleGoogleSignIn} className="w-full">
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>) : (<>Sign in with Google</>)}
              </Button>
              */}
            </CardContent>
          </form>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
