// Server-backed tournament service using API routes
import {
  getTournamentRegistrations as getStoredTournamentRegistrations,
  createRegistration as createStoredRegistration,
  updateRegistrationStatus as updateStoredRegistrationStatus,
} from "./server-storage"

export const getAllTournaments = async () => {
  const res = await fetch("/api/tournaments", { cache: "no-store" })
  if (!res.ok) return []
  const { tournaments } = await res.json()
  return tournaments || []
}

// Get tournament by ID
export const getTournamentById = async (id) => {
  const res = await fetch(`/api/tournaments/${id}`, { cache: "no-store" })
  if (!res.ok) return null
  const { tournament } = await res.json()
  return tournament || null
}

// Create a new tournament
const buildHeaders = (token) => {
  const headers = { "Content-Type": "application/json" }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export const createTournament = async (tournamentData, token) => {
  const res = await fetch("/api/tournaments", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(tournamentData),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || "Failed to create tournament")
  }
  const { tournament } = await res.json()
  return tournament
}

// Update a tournament
export const updateTournament = async (id, tournamentData, token) => {
  const res = await fetch(`/api/tournaments/${id}`, {
    method: "PATCH",
    headers: buildHeaders(token),
    body: JSON.stringify(tournamentData),
  })
  if (!res.ok) throw new Error("Failed to update tournament")
  const { tournament } = await res.json()
  return tournament
}

// Delete a tournament
export const deleteTournament = async (id, token) => {
  const res = await fetch(`/api/tournaments/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok && res.status !== 204) throw new Error("Failed to delete tournament")
  return true
}

// Get tournaments by organizer
export async function getOrganizerTournaments(organizerId) {
  const all = await getAllTournaments()
  return all.filter((t) => t.organizerId === organizerId)
}

// Upload tournament banner image using Vercel Blob
export async function uploadTournamentImage(file) {
  // Convert File → base64 data-URL and store it in tournaments
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error("Failed to read the image file"))
      reader.readAsDataURL(file)
    } catch (err) {
      reject(err)
    }
  })
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
