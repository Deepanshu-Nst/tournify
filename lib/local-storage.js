// Local storage keys
const STORAGE_KEYS = {
  TOURNAMENTS: "tournify_tournaments",
  REGISTRATIONS: "tournify_registrations",
  USERS: "tournify_users",
}

// Helper function to generate unique IDs
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// Helper function to get data from localStorage
function getStoredData(key, defaultValue = []) {
  if (typeof window === "undefined") return defaultValue

  try {
    const storedData = localStorage.getItem(key)
    return storedData ? JSON.parse(storedData) : defaultValue
  } catch (error) {
    console.error(`Error retrieving data from localStorage (${key}):`, error)
    return defaultValue
  }
}

// Helper function to set data in localStorage
function setStoredData(key, data) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(data))

    // Also store in sessionStorage for cross-browser persistence
    sessionStorage.setItem(key, JSON.stringify(data))

    // If we're in a deployed environment, try to use IndexedDB for better persistence
    if (typeof window !== "undefined" && window.indexedDB && process.env.NODE_ENV === "production") {
      storeInIndexedDB(key, data)
    }
  } catch (error) {
    console.error(`Error storing data in localStorage (${key}):`, error)
  }
}

// Store data in IndexedDB for better persistence
function storeInIndexedDB(key, data) {
  try {
    const request = window.indexedDB.open("TournifyDB", 1)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains("tournifyData")) {
        db.createObjectStore("tournifyData", { keyPath: "key" })
      }
    }

    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction(["tournifyData"], "readwrite")
      const store = transaction.objectStore("tournifyData")

      store.put({ key, data })
    }
  } catch (error) {
    console.error("IndexedDB storage failed:", error)
    // Silently fail - we still have localStorage as backup
  }
}

// Try to get data from IndexedDB first, then fall back to localStorage
export async function getPersistedData(key, defaultValue = []) {
  if (typeof window === "undefined") return defaultValue

  // First try to get from sessionStorage (for current session)
  try {
    const sessionData = sessionStorage.getItem(key)
    if (sessionData) {
      return JSON.parse(sessionData)
    }
  } catch (error) {
    console.error("Error getting data from sessionStorage:", error)
  }

  // Then try IndexedDB (for cross-browser persistence)
  if (window.indexedDB && process.env.NODE_ENV === "production") {
    try {
      return new Promise((resolve) => {
        const request = window.indexedDB.open("TournifyDB", 1)

        request.onsuccess = (event) => {
          const db = event.target.result
          if (!db.objectStoreNames.contains("tournifyData")) {
            resolve(getStoredData(key, defaultValue))
            return
          }

          const transaction = db.transaction(["tournifyData"], "readonly")
          const store = transaction.objectStore("tournifyData")
          const getRequest = store.get(key)

          getRequest.onsuccess = (event) => {
            if (event.target.result) {
              resolve(event.target.result.data)
            } else {
              resolve(getStoredData(key, defaultValue))
            }
          }

          getRequest.onerror = () => {
            resolve(getStoredData(key, defaultValue))
          }
        }

        request.onerror = () => {
          resolve(getStoredData(key, defaultValue))
        }
      })
    } catch (error) {
      console.error("Error getting data from IndexedDB:", error)
    }
  }

  // Fall back to localStorage
  return getStoredData(key, defaultValue)
}

// User profile functions
export function getStoredUserProfile(userId) {
  const users = getStoredData(STORAGE_KEYS.USERS, [])
  return users.find((user) => user.uid === userId) || null
}

export function updateStoredUserProfile(userId, profileData) {
  const users = getStoredData(STORAGE_KEYS.USERS, [])
  const userIndex = users.findIndex((user) => user.uid === userId)

  const updatedUser = {
    uid: userId,
    ...profileData,
    updatedAt: new Date().toISOString(),
  }

  if (userIndex >= 0) {
    users[userIndex] = { ...users[userIndex], ...updatedUser }
  } else {
    users.push({
      ...updatedUser,
      createdAt: new Date().toISOString(),
    })
  }

  setStoredData(STORAGE_KEYS.USERS, users)
  return updatedUser
}

// Tournament functions
export async function getAllStoredTournaments() {
  return getPersistedData(STORAGE_KEYS.TOURNAMENTS, [])
}

export async function getStoredTournamentById(id) {
  const tournaments = await getAllStoredTournaments()
  return tournaments.find((tournament) => tournament.id === id) || null
}

export async function getStoredTournamentsByOrganizer(organizerId) {
  const tournaments = await getAllStoredTournaments()
  return tournaments.filter((tournament) => tournament.organizerId === organizerId)
}

export async function createStoredTournament(tournamentData, organizerId) {
  const tournaments = await getAllStoredTournaments()

  const newTournament = {
    id: generateId(),
    ...tournamentData,
    organizerId,
    registeredTeams: 0,
    status: "upcoming",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  tournaments.push(newTournament)
  setStoredData(STORAGE_KEYS.TOURNAMENTS, tournaments)

  return newTournament
}

export async function updateStoredTournament(id, data) {
  const tournaments = await getAllStoredTournaments()
  const tournamentIndex = tournaments.findIndex((t) => t.id === id)

  if (tournamentIndex === -1) {
    throw new Error(`Tournament with ID ${id} not found`)
  }

  tournaments[tournamentIndex] = {
    ...tournaments[tournamentIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  setStoredData(STORAGE_KEYS.TOURNAMENTS, tournaments)
  return tournaments[tournamentIndex]
}

export async function deleteStoredTournament(id) {
  const tournaments = await getAllStoredTournaments()
  const filteredTournaments = tournaments.filter((t) => t.id !== id)

  setStoredData(STORAGE_KEYS.TOURNAMENTS, filteredTournaments)

  // Also delete related registrations
  const registrations = await getPersistedData(STORAGE_KEYS.REGISTRATIONS, [])
  const filteredRegistrations = registrations.filter((r) => r.tournamentId !== id)
  setStoredData(STORAGE_KEYS.REGISTRATIONS, filteredRegistrations)

  return true
}

// Registration functions
export async function getStoredTournamentRegistrations(tournamentId) {
  const registrations = await getPersistedData(STORAGE_KEYS.REGISTRATIONS, [])
  return registrations.filter((reg) => reg.tournamentId === tournamentId)
}

export async function getStoredUserRegistrations(userId) {
  const registrations = await getPersistedData(STORAGE_KEYS.REGISTRATIONS, [])
  return registrations.filter((reg) => reg.userId === userId)
}

export async function createStoredRegistration(tournamentId, registrationData, userId) {
  const registrations = await getPersistedData(STORAGE_KEYS.REGISTRATIONS, [])

  // Check if user is already registered
  const existingRegistration = registrations.find((reg) => reg.tournamentId === tournamentId && reg.userId === userId)

  if (existingRegistration) {
    throw new Error("You are already registered for this tournament")
  }

  const newRegistration = {
    id: generateId(),
    ...registrationData,
    tournamentId,
    userId,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  registrations.push(newRegistration)
  setStoredData(STORAGE_KEYS.REGISTRATIONS, registrations)

  // Update tournament registered count
  const tournaments = await getAllStoredTournaments()
  const tournamentIndex = tournaments.findIndex((t) => t.id === tournamentId)

  if (tournamentIndex !== -1) {
    tournaments[tournamentIndex].registeredTeams = (tournaments[tournamentIndex].registeredTeams || 0) + 1
    setStoredData(STORAGE_KEYS.TOURNAMENTS, tournaments)
  }

  return newRegistration
}

export async function updateStoredRegistrationStatus(registrationId, status) {
  const registrations = await getPersistedData(STORAGE_KEYS.REGISTRATIONS, [])
  const registrationIndex = registrations.findIndex((r) => r.id === registrationId)

  if (registrationIndex === -1) {
    throw new Error(`Registration with ID ${registrationId} not found`)
  }

  registrations[registrationIndex] = {
    ...registrations[registrationIndex],
    status,
    updatedAt: new Date().toISOString(),
  }

  setStoredData(STORAGE_KEYS.REGISTRATIONS, registrations)
  return registrations[registrationIndex]
}

// Initialize with sample data if empty
export function initializeLocalStorage() {
  if (typeof window === "undefined") return

  // Only initialize if no data exists
  getPersistedData(STORAGE_KEYS.TOURNAMENTS).then((tournaments) => {
    if (tournaments.length === 0) {
      const sampleTournaments = [
        {
          id: "sample1",
          title: "PUBG Mobile Championship",
          game: "PUBG Mobile",
          description: "Join the biggest PUBG Mobile tournament of the year!",
          startDate: "2025-06-15",
          endDate: "2025-06-20",
          totalSlots: 32,
          registeredTeams: 12,
          status: "upcoming",
          format: "Single Elimination",
          prizePool: "$5,000",
          registrationType: "Free",
          venue: "Online",
          organizerId: "sample-organizer",
          organizerName: "Tournify Official",
          image: "/placeholder.svg?height=400&width=800",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "sample2",
          title: "Valorant Pro League",
          game: "Valorant",
          description: "Professional Valorant tournament with top teams from around the world.",
          startDate: "2025-05-10",
          endDate: "2025-05-15",
          totalSlots: 16,
          registeredTeams: 16,
          status: "active",
          format: "Double Elimination",
          prizePool: "$10,000",
          registrationType: "Paid",
          venue: "Online",
          organizerId: "sample-organizer",
          organizerName: "Tournify Official",
          image: "/placeholder.svg?height=400&width=800",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "sample3",
          title: "FIFA World Cup 2024",
          game: "FIFA",
          description: "Annual FIFA tournament for all skill levels.",
          startDate: "2024-12-01",
          endDate: "2024-12-10",
          totalSlots: 64,
          registeredTeams: 64,
          status: "completed",
          format: "Group Stage + Playoffs",
          prizePool: "$2,000",
          registrationType: "Free",
          venue: "Gaming Arena",
          organizerId: "sample-organizer",
          organizerName: "Tournify Official",
          image: "/placeholder.svg?height=400&width=800",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      setStoredData(STORAGE_KEYS.TOURNAMENTS, sampleTournaments)
    }
  })
}
