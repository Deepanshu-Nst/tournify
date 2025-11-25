// Server-backed tournament service using API routes

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
export const createTournament = async (tournamentData) => {
  const res = await fetch("/api/tournaments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
export const updateTournament = async (id, tournamentData, organizerId) => {
  const payload = organizerId ? { ...tournamentData, organizerId } : tournamentData
  const res = await fetch(`/api/tournaments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to update tournament")
  const { tournament } = await res.json()
  return tournament
}

// Delete a tournament
export const deleteTournament = async (id, organizerId) => {
  const res = await fetch(`/api/tournaments/${id}`, {
    method: "DELETE",
    headers: organizerId ? { "Content-Type": "application/json" } : undefined,
    body: organizerId ? JSON.stringify({ organizerId }) : undefined,
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
  const res = await fetch(`/api/tournaments/${tournamentId}/registrations`, { cache: "no-store" })
  if (!res.ok) return []
  const { registrations } = await res.json()
  return registrations || []
}

export const updateRegistrationStatus = async (registrationId, status) => {
  const res = await fetch(`/api/registrations/${registrationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error || "Failed to update registration status")
  }
  return data.registration
}

export const registerForTournament = async (tournamentId, registrationData) => {
  const res = await fetch(`/api/tournaments/${tournamentId}/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registrationData),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error || "Failed to register for tournament")
  }
  return data.registration
}
