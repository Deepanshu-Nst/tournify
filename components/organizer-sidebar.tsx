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
        "bg-card h-screen border-r flex flex-col transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h2 className="font-bold text-lg">Organizer Panel</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto", collapsed && "mx-auto")}
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            const ItemIcon = item.icon

            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", collapsed && "justify-center px-2")}
                  >
                    <ItemIcon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
                    {!collapsed && <span>{item.name}</span>}
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
