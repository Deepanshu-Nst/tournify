"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Trophy, LayoutDashboard, Users, Settings, MessageSquare, FileText, Menu, ChevronLeft } from "lucide-react"

export function OrganizerSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/organizer/dashboard", icon: LayoutDashboard },
    { name: "Tournaments", href: "/organizer/tournaments", icon: Trophy },
    { name: "Participants", href: "/organizer/participants", icon: Users },
    { name: "Announcements", href: "/organizer/announcements", icon: FileText },
    { name: "Queries", href: "/organizer/queries", icon: MessageSquare },
    { name: "Settings", href: "/organizer/settings", icon: Settings },
  ]

  return (
    <div
      className={cn(
        "bg-card h-screen border-r flex flex-col transition-width duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b">
        {!collapsed && <h2 className="font-bold text-lg">Organizer Panel</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="p-0"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link href={item.href} passHref>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full flex items-center",
                      collapsed ? "justify-center" : "justify-start space-x-2 px-4"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </Button>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}