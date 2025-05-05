import { put } from "@vercel/blob"
import {
  getTournamentsByOrganizer as getStoredTournamentsByOrganizer,
  getTournamentRegistrations as getStoredTournamentRegistrations,
  createRegistration as createStoredRegistration,
  updateRegistrationStatus as updateStoredRegistrationStatus,
  initializeStorage,
} from "./server-storage"

// Initialize storage with sample data
if (typeof window !== "undefined") {
  initializeStorage()
}

// Global storage key
const TOURNAMENTS_STORAGE_KEY = "tournify_tournaments"

// Helper function to broadcast tournament updates to other tabs
const broadcastUpdate = (tournaments) => {
  try {
    // Try to use BroadcastChannel API for modern browsers
    const broadcastChannel = new BroadcastChannel("tournify_sync")
    broadcastChannel.postMessage({
      type: "TOURNAMENTS_UPDATED",
      tournaments,
    })
    broadcastChannel.close()
  } catch (error) {
    console.log("BroadcastChannel not supported, using localStorage events")
    // The localStorage event will handle cross-tab communication
  }
}

// Get all tournaments
export const getAllTournaments = async () => {
  try {
    // Try to get tournaments from global window object first (fastest)
    if (typeof window !== "undefined" && window.tournifyTournaments) {
      return window.tournifyTournaments
    }

    // Fallback to localStorage
    const storedTournaments = localStorage.getItem(TOURNAMENTS_STORAGE_KEY)
    if (storedTournaments) {
      const tournaments = JSON.parse(storedTournaments)
      // Update global object for faster access next time
      if (typeof window !== "undefined") {
        window.tournifyTournaments = tournaments
      }
      return tournaments
    }

    // If no tournaments found, return empty array
    return []
  } catch (error) {
    console.error("Error getting tournaments:", error)
    return []
  }
}

// Get tournament by ID
export const getTournamentById = async (id) => {
  try {
    const tournaments = await getAllTournaments()
    return tournaments.find((tournament) => tournament.id === id) || null
  } catch (error) {
    console.error(`Error getting tournament with ID ${id}:`, error)
    return null
  }
}

// Create a new tournament
export const createTournament = async (tournamentData) => {
  try {
    // Get existing tournaments
    const tournaments = await getAllTournaments()

    // Add new tournament
    const newTournament = {
      ...tournamentData,
      id: tournamentData.id || `tournament_${Date.now()}`,
      createdAt: new Date().toISOString(),
      registeredTeams: 0,
    }

    const updatedTournaments = [...tournaments, newTournament]

    // Update localStorage
    localStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(updatedTournaments))

    // Update global object
    if (typeof window !== "undefined") {
      window.tournifyTournaments = updatedTournaments
    }

    // Broadcast update to other tabs
    broadcastUpdate(updatedTournaments)

    return newTournament
  } catch (error) {
    console.error("Error creating tournament:", error)
    throw error
  }
}

// Update a tournament
export const updateTournament = async (id, tournamentData) => {
  try {
    // Get existing tournaments
    const tournaments = await getAllTournaments()

    // Find tournament index
    const tournamentIndex = tournaments.findIndex((tournament) => tournament.id === id)

    if (tournamentIndex === -1) {
      throw new Error(`Tournament with ID ${id} not found`)
    }

    // Update tournament
    const updatedTournament = {
      ...tournaments[tournamentIndex],
      ...tournamentData,
      updatedAt: new Date().toISOString(),
    }

    const updatedTournaments = [...tournaments]
    updatedTournaments[tournamentIndex] = updatedTournament

    // Update localStorage
    localStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(updatedTournaments))

    // Update global object
    if (typeof window !== "undefined") {
      window.tournifyTournaments = updatedTournaments
    }

    // Broadcast update to other tabs
    broadcastUpdate(updatedTournaments)

    return updatedTournament
  } catch (error) {
    console.error(`Error updating tournament with ID ${id}:`, error)
    throw error
  }
}

// Delete a tournament
export const deleteTournament = async (id) => {
  try {
    // Get existing tournaments
    const tournaments = await getAllTournaments()

    // Filter out the tournament to delete
    const updatedTournaments = tournaments.filter((tournament) => tournament.id !== id)

    // Update localStorage
    localStorage.setItem(TOURNAMENTS_STORAGE_KEY, JSON.stringify(updatedTournaments))

    // Update global object
    if (typeof window !== "undefined") {
      window.tournifyTournaments = updatedTournaments
    }

    // Broadcast update to other tabs
    broadcastUpdate(updatedTournaments)

    return true
  } catch (error) {
    console.error(`Error deleting tournament with ID ${id}:`, error)
    throw error
  }
}

// Get tournaments by organizer
export async function getOrganizerTournaments(organizerId) {
  try {
    return await getStoredTournamentsByOrganizer(organizerId)
  } catch (error) {
    console.error("Error getting organizer tournaments:", error)
    return []
  }
}

// Upload tournament banner image using Vercel Blob
export async function uploadTournamentImage(file, tournamentId) {
  try {
    // Try to use Vercel Blob
    try {
      // Generate a unique filename
      const filename = `tournaments/${tournamentId || "new"}/${Date.now()}-${file.name}`

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      })

      return blob.url
    } catch (blobError) {
      console.error("Vercel Blob error:", blobError)

      // Fallback to data URL if Vercel Blob fails
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error("Failed to read the image file"))
        reader.readAsDataURL(file)
      })
    }
  } catch (error) {
    console.error("Error uploading tournament image:", error)
    throw error
  }
}

export const getTournamentRegistrations = async (tournamentId) => {
  try {
    return await getStoredTournamentRegistrations(tournamentId)
  } catch (error) {
    console.error("Error getting tournament registrations:", error)
    return []
  }
}

export const updateRegistrationStatus = async (registrationId, status) => {
  try {
    return await updateStoredRegistrationStatus(registrationId, status)
  } catch (error) {
    console.error("Error updating registration status:", error)
    throw error
  }
}

export const registerForTournament = async (tournamentId, registrationData, userId) => {
  try {
    return await createStoredRegistration(tournamentId, registrationData, userId)
  } catch (error) {
    console.error("Error registering for tournament:", error)
    throw error
  }
}
