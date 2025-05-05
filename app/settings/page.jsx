"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [emailNotifications, setEmailNotifications] = useState({
    tournaments: true,
    registrations: true,
    announcements: true,
    results: true,
  })
  const [pushNotifications, setPushNotifications] = useState({
    tournaments: false,
    registrations: true,
    announcements: false,
    results: true,
  })

  if (!user) {
    router.push("/login")
    return null
  }

  const handleEmailToggle = (key) => {
    setEmailNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handlePushToggle = (key) => {
    setPushNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated.",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
          </div>

          <Tabs defaultValue="notifications" className="space-y-4">
            <TabsList>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how you receive notifications from Tournify.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-tournaments">New Tournaments</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about new tournaments in your area.
                          </p>
                        </div>
                        <Switch
                          id="email-tournaments"
                          checked={emailNotifications.tournaments}
                          onCheckedChange={() => handleEmailToggle("tournaments")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-registrations">Registration Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about your tournament registrations.
                          </p>
                        </div>
                        <Switch
                          id="email-registrations"
                          checked={emailNotifications.registrations}
                          onCheckedChange={() => handleEmailToggle("registrations")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-announcements">Tournament Announcements</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive announcements from tournaments you're registered for.
                          </p>
                        </div>
                        <Switch
                          id="email-announcements"
                          checked={emailNotifications.announcements}
                          onCheckedChange={() => handleEmailToggle("announcements")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-results">Results & Standings</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about tournament results and standings.
                          </p>
                        </div>
                        <Switch
                          id="email-results"
                          checked={emailNotifications.results}
                          onCheckedChange={() => handleEmailToggle("results")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-tournaments">New Tournaments</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications about new tournaments in your area.
                          </p>
                        </div>
                        <Switch
                          id="push-tournaments"
                          checked={pushNotifications.tournaments}
                          onCheckedChange={() => handlePushToggle("tournaments")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-registrations">Registration Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications about your tournament registrations.
                          </p>
                        </div>
                        <Switch
                          id="push-registrations"
                          checked={pushNotifications.registrations}
                          onCheckedChange={() => handlePushToggle("registrations")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-announcements">Tournament Announcements</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push announcements from tournaments you're registered for.
                          </p>
                        </div>
                        <Switch
                          id="push-announcements"
                          checked={pushNotifications.announcements}
                          onCheckedChange={() => handlePushToggle("announcements")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-results">Results & Standings</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push updates about tournament results and standings.
                          </p>
                        </div>
                        <Switch
                          id="push-results"
                          checked={pushNotifications.results}
                          onCheckedChange={() => handlePushToggle("results")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize how Tournify looks for you.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-10 text-muted-foreground">Appearance settings will be available soon.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Manage your privacy and data settings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-10 text-muted-foreground">Privacy settings will be available soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
