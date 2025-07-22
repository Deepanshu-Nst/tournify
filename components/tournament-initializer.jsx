"use client"

import { useEffect } from "react"
import { initializeStorage } from "@/lib/server-storage"

// Same key used everywhere
const TOURNAMENTS_STORAGE_KEY = "tournify_tournaments"

export function TournamentInitializer() {
  useEffect(() => {
    // Use the single source-of-truth initializer so every area of the app sees the same baseline data
    initializeStorage()

    // After initializeStorage we still copy data to a global for faster access
    window.tournifyTournaments = JSON.parse(localStorage.getItem(TOURNAMENTS_STORAGE_KEY) || "[]")

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
