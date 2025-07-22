"use client"

import { useEffect } from "react"

// Default tournaments to ensure there's always data
const DEFAULT_TOURNAMENTS = [
  {
    id: "pubg-mobile-championship",
    title: "PUBG Mobile Championship",
    game: "PUBG Mobile",
    description: "The ultimate PUBG Mobile tournament for professional teams.",
    startDate: "2025-06-15",
    endDate: "2025-06-20",
    registrationDeadline: "2025-06-10",
    totalSlots: 32,
    registeredTeams: 12,
    status: "upcoming",
    registrationType: "Free",
    image: "https://www.hollywoodreporter.com/wp-content/uploads/2019/10/pubg_mobile.jpg?w=1296&h=730&crop=1",
    rules: "Standard PUBG Mobile tournament rules apply.",
    prizes: "1st Place: $5000, 2nd Place: $2500, 3rd Place: $1000",
    organizer: "Tournify Official",
    contact: "support@tournify.com",
  },
  {
    id: "valo-championship",
    title: "Valo Championship",
    game: "Valorant",
    description: "Competitive Valorant tournament for all skill levels.",
    startDate: "2025-05-14",
    endDate: "2025-05-16",
    registrationDeadline: "2025-05-10",
    totalSlots: 16,
    registeredTeams: 0,
    status: "upcoming",
    registrationType: "Free",
    image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.wired.com%2Fstory%2Friot-games-valorant-impressions%2F&psig=AOvVaw31bU4XciDEufPY3qHiEbPq&ust=1753196470991000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCKD-v_ibzo4DFQAAAAAdAAAAABAE",
    rules: "Standard Valorant tournament rules apply.",
    prizes: "1st Place: $2000, 2nd Place: $1000, 3rd Place: $500",
    organizer: "Tournify Official",
    contact: "support@tournify.com",
  },
  {
    id: "FIFA-mobile-championship",
    title: "FIFA Mobile Championship",
    game: "FIFA Mobile",
    description: "The ultimate FIFA Mobile tournament for professional teams.",
    startDate: "2025-06-15",
    endDate: "2025-06-20",
    registrationDeadline: "2025-06-10",
    totalSlots: 32,
    registeredTeams: 12,
    status: "upcoming",
    registrationType: "Free",
    image: "/placeholder.svg?height=200&width=400",
    rules: "Standard FIFA Mobile tournament rules apply.",
    prizes: "1st Place: $5000, 2nd Place: $2500, 3rd Place: $1000",
    organizer: "Tournify Official",
    contact: "support@tournify.com",
  },
  {
    id: "valorant-championship",
    title: "Valorant Championship",
    game: "Valorant",
    description: "The ultimate Valorant tournament for professional teams.",
    startDate: "2025-06-15",
    endDate: "2025-06-20",
    registrationDeadline: "2025-06-10",
    totalSlots: 32,
    registeredTeams: 12,
    status: "upcoming",
    registrationType: "Free",
    image: "/placeholder.svg?height=200&width=400",
    rules: "Standard Valorant tournament rules apply.",
    prizes: "1st Place: $5000, 2nd Place: $2500, 3rd Place: $1000",
    organizer: "Tournify Official",
    contact: "support@tournify.com",
  },
  {
    id: "counter-strike-championship",
    title: "Counter-Strike Championship",
    game: "Counter-Strike",
    description: "The ultimate Counter-Strike tournament for professional teams.",
    startDate: "2025-06-15",
    endDate: "2025-06-20",
    registrationDeadline: "2025-06-10",
    totalSlots: 32,
    registeredTeams: 12,
    status: "upcoming",
    registrationType: "Free",
    image: "/placeholder.svg?height=200&width=400",
    rules: "Standard Counter-Strike tournament rules apply.",
    prizes: "1st Place: $5000, 2nd Place: $2500, 3rd Place: $1000",
    organizer: "Tournify Official",
    contact: "support@tournify.com",
  },
  {
    id: "dota-2-championship",
    title: "Dota 2 Championship",
    game: "Dota 2",
    description: "The ultimate Dota 2 tournament for professional teams.",
    startDate: "2025-06-15",
    endDate: "2025-06-20",
    registrationDeadline: "2025-06-10",
    totalSlots: 32,
    registeredTeams: 12,
    status: "upcoming",
    registrationType: "Free",
    image: "/placeholder.svg?height=200&width=400",
    rules: "Standard Dota 2 tournament rules apply.",
    prizes: "1st Place: $5000, 2nd Place: $2500, 3rd Place: $1000",
    organizer: "Tournify Official",
    contact: "support@tournify.com",
  },
  {
    id: "fortnite-championship",
    title: "Fortnite Championship",
    game: "Fortnite",
    description: "The ultimate Fortnite tournament for professional teams.",
    startDate: "2025-06-15",
    endDate: "2025-06-20",
    registrationDeadline: "2025-06-10",
    totalSlots: 32,
    registeredTeams: 12,
    status: "upcoming",
    registrationType: "Free",
    image: "/placeholder.svg?height=200&width=400",
    rules: "Standard Fortnite tournament rules apply.",
    prizes: "1st Place: $5000, 2nd Place: $2500, 3rd Place: $1000",
    organizer: "Tournify Official",
    contact: "support@tournify.com",
  },
  {
    id: "pubg-mobile-championship",
    title: "Rocket League Championship",
    game: "Rocket League",
    description: "The ultimate Rocket League tournament for professional teams.",
    startDate: "2025-06-15",
    endDate: "2025-06-20",
    registrationDeadline: "2025-06-10",
    totalSlots: 32,
    registeredTeams: 12,
    status: "upcoming",
    registrationType: "Free",
    image: "/placeholder.svg?height=200&width=400",
    rules: "Standard Rocket League tournament rules apply.",
    prizes: "1st Place: $5000, 2nd Place: $2500, 3rd Place: $1000",
    organizer: "Tournify Official",
    contact: "support@tournify.com",
  },
]

// Global storage key
const TOURNAMENTS_STORAGE_KEY = "tournify_tournaments"

export function TournamentInitializer() {
  useEffect(() => {
    // Initialize tournaments in localStorage if they don't exist
    const initializeTournaments = () => {
      try {
        // Check if tournaments exist in localStorage
        const storedTournaments = localStorage.getItem(TOURNAMENTS_STORAGE_KEY)

        if (!storedTournaments) {
          // If not, initialize with default tournaments
          localStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_TOURNAMENTS))
          console.log("Initialized default tournaments")
        }

        // Make tournaments available globally
        if (typeof window !== "undefined") {
          window.tournifyTournaments = JSON.parse(localStorage.getItem(TOURNAMENTS_STORAGE_KEY) || "[]")
        }
      } catch (error) {
        console.error("Error initializing tournaments:", error)
      }
    }

    initializeTournaments()

    // Set up cross-tab communication
    let broadcastChannel

    try {
      // Try to use BroadcastChannel API for modern browsers
      broadcastChannel = new BroadcastChannel("tournify_sync")

      broadcastChannel.onmessage = (event) => {
        if (event.data.type === "TOURNAMENTS_UPDATED") {
          localStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(event.data.tournaments))
          window.tournifyTournaments = event.data.tournaments
        }
      }
    } catch (error) {
      console.log("BroadcastChannel not supported, using localStorage events")
    }

    // Fallback for browsers that don't support BroadcastChannel
    const handleStorageChange = (event) => {
      if (event.key === TOURNAMENTS_STORAGE_KEY) {
        window.tournifyTournaments = JSON.parse(event.newValue || "[]")
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      // Clean up
      if (broadcastChannel) {
        broadcastChannel.close()
      }
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return null
}
