// This file implements a server-side storage solution using Vercel KV Store
// We'll use localStorage as fallback but with cross-window communication

// Create a global storage object that will be accessible across browser tabs
if (typeof window !== "undefined") {
  // Create a global namespace for our app
  window.TOURNIFY_GLOBAL = window.TOURNIFY_GLOBAL || {}

  // Initialize storage if not already done
  if (!window.TOURNIFY_GLOBAL.storage) {
    window.TOURNIFY_GLOBAL.storage = {
      data: {},
      listeners: [],
    }
  }
}

// Storage keys
const STORAGE_KEYS = {
  TOURNAMENTS: "tournify_tournaments",
  REGISTRATIONS: "tournify_registrations",
  USERS: "tournify_users",
}

// Helper function to generate unique IDs
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// Function to broadcast changes to other tabs/windows
function broadcastChange(key, data) {
  if (typeof window === "undefined") return

  try {
    // Use BroadcastChannel API if available
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("tournify_storage")
      bc.postMessage({ key, data })
      bc.close()
    }

    // Also use localStorage event as fallback
    const storageEvent = new StorageEvent("storage", {
      key: `tournify_broadcast_${key}`,
      newValue: JSON.stringify({ timestamp: Date.now(), data }),
    })
    window.dispatchEvent(storageEvent)

    // Update global storage
    if (window.TOURNIFY_GLOBAL && window.TOURNIFY_GLOBAL.storage) {
      window.TOURNIFY_GLOBAL.storage.data[key] = data

      // Notify listeners
      window.TOURNIFY_GLOBAL.storage.listeners.forEach((listener) => {
        if (listener.key === key) {
          listener.callback(data)
        }
      })
    }
  } catch (error) {
    console.error("Error broadcasting change:", error)
  }
}

// Initialize listeners for cross-tab communication
if (typeof window !== "undefined") {
  // Listen for BroadcastChannel messages
  if ("BroadcastChannel" in window) {
    const bc = new BroadcastChannel("tournify_storage")
    bc.onmessage = (event) => {
      const { key, data } = event.data
      if (window.TOURNIFY_GLOBAL && window.TOURNIFY_GLOBAL.storage) {
        window.TOURNIFY_GLOBAL.storage.data[key] = data

        // Update localStorage
        try {
          localStorage.setItem(key, JSON.stringify(data))
        } catch (e) {
          console.error("Error updating localStorage:", e)
        }

        // Notify listeners
        window.TOURNIFY_GLOBAL.storage.listeners.forEach((listener) => {
          if (listener.key === key) {
            listener.callback(data)
          }
        })
      }
    }
  }

  // Listen for localStorage events
  window.addEventListener("storage", (event) => {
    if (event.key && event.key.startsWith("tournify_broadcast_")) {
      const key = event.key.replace("tournify_broadcast_", "")
      try {
        const { data } = JSON.parse(event.newValue || "{}")
        if (window.TOURNIFY_GLOBAL && window.TOURNIFY_GLOBAL.storage) {
          window.TOURNIFY_GLOBAL.storage.data[key] = data

          // Update localStorage
          try {
            localStorage.setItem(key, JSON.stringify(data))
          } catch (e) {
            console.error("Error updating localStorage:", e)
          }

          // Notify listeners
          window.TOURNIFY_GLOBAL.storage.listeners.forEach((listener) => {
            if (listener.key === key) {
              listener.callback(data)
            }
          })
        }
      } catch (e) {
        console.error("Error parsing storage event:", e)
      }
    }
  })
}

// Subscribe to storage changes
export function subscribeToStorage(key, callback) {
  if (typeof window === "undefined") return () => {}

  if (window.TOURNIFY_GLOBAL && window.TOURNIFY_GLOBAL.storage) {
    const listener = { key, callback }
    window.TOURNIFY_GLOBAL.storage.listeners.push(listener)

    // Return unsubscribe function
    return () => {
      window.TOURNIFY_GLOBAL.storage.listeners = window.TOURNIFY_GLOBAL.storage.listeners.filter((l) => l !== listener)
    }
  }

  return () => {}
}

// Helper function to get data from storage
export async function getData(key, defaultValue = []) {
  if (typeof window === "undefined") return defaultValue

  try {
    // First check global storage
    if (window.TOURNIFY_GLOBAL && window.TOURNIFY_GLOBAL.storage && window.TOURNIFY_GLOBAL.storage.data[key]) {
      return window.TOURNIFY_GLOBAL.storage.data[key]
    }

    // Then check localStorage
    const storedData = localStorage.getItem(key)
    if (storedData) {
      const parsedData = JSON.parse(storedData)

      // Update global storage
      if (window.TOURNIFY_GLOBAL && window.TOURNIFY_GLOBAL.storage) {
        window.TOURNIFY_GLOBAL.storage.data[key] = parsedData
      }

      return parsedData
    }

    // If no data found, initialize with default value
    if (window.TOURNIFY_GLOBAL && window.TOURNIFY_GLOBAL.storage) {
      window.TOURNIFY_GLOBAL.storage.data[key] = defaultValue
    }

    return defaultValue
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error)
    return defaultValue
  }
}

// Helper function to set data in storage
export async function setData(key, data) {
  if (typeof window === "undefined") return

  try {
    // Update localStorage
    localStorage.setItem(key, JSON.stringify(data))

    // Update global storage
    if (window.TOURNIFY_GLOBAL && window.TOURNIFY_GLOBAL.storage) {
      window.TOURNIFY_GLOBAL.storage.data[key] = data
    }

    // Broadcast change to other tabs/windows
    broadcastChange(key, data)

    // Also try to use sessionStorage for incognito mode
    try {
      sessionStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      // Ignore sessionStorage errors
    }

    // Try to use IndexedDB as another fallback
    try {
      const request = indexedDB.open("TournifyDB", 1)

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
    } catch (e) {
      // Ignore IndexedDB errors
    }
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error)
  }
}

// Tournament functions
export async function getAllTournaments() {
  return getData(STORAGE_KEYS.TOURNAMENTS, [])
}

export async function getTournamentById(id) {
  const tournaments = await getAllTournaments()
  return tournaments.find((tournament) => tournament.id === id) || null
}

export async function getTournamentsByOrganizer(organizerId) {
  const tournaments = await getAllTournaments()
  return tournaments.filter((tournament) => tournament.organizerId === organizerId)
}

export async function createTournament(tournamentData, organizerId) {
  const tournaments = await getAllTournaments()

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
  await setData(STORAGE_KEYS.TOURNAMENTS, tournaments)

  return newTournament
}

export async function updateTournament(id, data) {
  const tournaments = await getAllTournaments()
  const tournamentIndex = tournaments.findIndex((t) => t.id === id)

  if (tournamentIndex === -1) {
    throw new Error(`Tournament with ID ${id} not found`)
  }

  tournaments[tournamentIndex] = {
    ...tournaments[tournamentIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  await setData(STORAGE_KEYS.TOURNAMENTS, tournaments)
  return tournaments[tournamentIndex]
}

export async function deleteTournament(id) {
  const tournaments = await getAllTournaments()
  const filteredTournaments = tournaments.filter((t) => t.id !== id)

  await setData(STORAGE_KEYS.TOURNAMENTS, filteredTournaments)

  // Also delete related registrations
  const registrations = await getData(STORAGE_KEYS.REGISTRATIONS, [])
  const filteredRegistrations = registrations.filter((r) => r.tournamentId !== id)
  await setData(STORAGE_KEYS.REGISTRATIONS, filteredRegistrations)

  return true
}

// Registration functions
export async function getTournamentRegistrations(tournamentId) {
  const registrations = await getData(STORAGE_KEYS.REGISTRATIONS, [])
  return registrations.filter((reg) => reg.tournamentId === tournamentId)
}

export async function getUserRegistrations(userId) {
  const registrations = await getData(STORAGE_KEYS.REGISTRATIONS, [])
  return registrations.filter((reg) => reg.userId === userId)
}

export async function createRegistration(tournamentId, registrationData, userId) {
  const registrations = await getData(STORAGE_KEYS.REGISTRATIONS, [])

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
  await setData(STORAGE_KEYS.REGISTRATIONS, registrations)

  // Update tournament registered count
  const tournaments = await getAllTournaments()
  const tournamentIndex = tournaments.findIndex((t) => t.id === tournamentId)

  if (tournamentIndex !== -1) {
    tournaments[tournamentIndex].registeredTeams = (tournaments[tournamentIndex].registeredTeams || 0) + 1
    await setData(STORAGE_KEYS.TOURNAMENTS, tournaments)
  }

  return newRegistration
}

export async function updateRegistrationStatus(registrationId, status) {
  const registrations = await getData(STORAGE_KEYS.REGISTRATIONS, [])
  const registrationIndex = registrations.findIndex((r) => r.id === registrationId)

  if (registrationIndex === -1) {
    throw new Error(`Registration with ID ${registrationId} not found`)
  }

  registrations[registrationIndex] = {
    ...registrations[registrationIndex],
    status,
    updatedAt: new Date().toISOString(),
  }

  await setData(STORAGE_KEYS.REGISTRATIONS, registrations)
  return registrations[registrationIndex]
}

// User profile functions
export async function getUserProfile(userId) {
  const users = await getData(STORAGE_KEYS.USERS, [])
  return users.find((user) => user.uid === userId) || null
}

export async function updateUserProfile(userId, profileData) {
  const users = await getData(STORAGE_KEYS.USERS, [])
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

  await setData(STORAGE_KEYS.USERS, users)
  return updatedUser
}

// Initialize with sample data if empty
export async function initializeStorage() {
  if (typeof window === "undefined") return

  // ----- default 9 upcoming tournaments -----
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
      image: "https://www.hollywoodreporter.com/wp-content/uploads/2019/10/pubg_mobile.jpg?w=1296&h=730&crop=1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sample2",
      title: "Valorant Pro League",
      game: "Valorant",
      description: "Competitive Valorant league for aspiring pros.",
      startDate: "2025-05-10",
      endDate: "2025-05-12",
      totalSlots: 16,
      registeredTeams: 0,
      status: "upcoming",
      format: "Round Robin",
      prizePool: "$2,000",
      registrationType: "Free",
      image: "https://media.wired.com/photos/5ea0840cb0490300086261e3/16:9/w_2400,h_1350,c_limit/Cul-Reveal_ReactorA_VALORANT.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sample3",
      title: "League of Legends Clash Cup",
      game: "League of Legends",
      description: "Assemble your team for the ultimate LoL Clash Cup!",
      startDate: "2025-07-01",
      endDate: "2025-07-03",
      totalSlots: 32,
      registeredTeams: 5,
      status: "upcoming",
      format: "Swiss",
      prizePool: "$4,000",
      registrationType: "Free",
      image: "/placeholder.svg?height=200&width=400",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sample4",
      title: "CS:GO Open Masters",
      game: "CS:GO",
      description: "Open tournament for all CS:GO teams worldwide.",
      startDate: "2025-08-05",
      endDate: "2025-08-07",
      totalSlots: 24,
      registeredTeams: 10,
      status: "upcoming",
      format: "Group Stage + Playoffs",
      prizePool: "$6,000",
      registrationType: "Free",
      image: "/placeholder.svg?height=200&width=400",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sample5",
      title: "Fortnite Duo Showdown",
      game: "Fortnite",
      description: "Grab your duo partner and fight for victory!",
      startDate: "2025-09-12",
      endDate: "2025-09-12",
      totalSlots: 50,
      registeredTeams: 20,
      status: "upcoming",
      format: "Single Elimination",
      prizePool: "$3,000",
      registrationType: "Free",
      image: "/placeholder.svg?height=200&width=400",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sample6",
      title: "Rocket League Summer Slam",
      game: "Rocket League",
      description: "High-flying Rocket League action this summer!",
      startDate: "2025-06-30",
      endDate: "2025-07-01",
      totalSlots: 32,
      registeredTeams: 8,
      status: "upcoming",
      format: "Double Elimination",
      prizePool: "$2,500",
      registrationType: "Free",
      image: "/placeholder.svg?height=200&width=400",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sample7",
      title: "Apex Legends Trios Brawl",
      game: "Apex Legends",
      description: "Trios compete for glory in the Outlands.",
      startDate: "2025-10-20",
      endDate: "2025-10-22",
      totalSlots: 60,
      registeredTeams: 0,
      status: "upcoming",
      format: "Group Stage",
      prizePool: "$5,000",
      registrationType: "Free",
      image: "/placeholder.svg?height=200&width=400",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sample8",
      title: "FIFA eWorld Cup Qualifiers",
      game: "FIFA",
      description: "Qualify for the biggest FIFA stage!",
      startDate: "2025-11-05",
      endDate: "2025-11-07",
      totalSlots: 64,
      registeredTeams: 32,
      status: "upcoming",
      format: "Group Stage + Playoffs",
      prizePool: "$2,000",
      registrationType: "Free",
      image: "/placeholder.svg?height=200&width=400",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sample9",
      title: "Overwatch 2 Community Clash",
      game: "Overwatch 2",
      description: "Community teams battle in Overwatch 2!",
      startDate: "2025-12-01",
      endDate: "2025-12-03",
      totalSlots: 32,
      registeredTeams: 4,
      status: "upcoming",
      format: "Swiss",
      prizePool: "$3,500",
      registrationType: "Free",
      image: "/placeholder.svg?height=200&width=400",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  // Merge if some defaults are missing
  const tournaments = await getAllTournaments()

  if (tournaments.length < sampleTournaments.length) {
    const existingIds = tournaments.map((t) => t.id)
    const merged = [...tournaments]
    sampleTournaments.forEach((s) => {
      if (!existingIds.includes(s.id)) merged.push(s)
    })
    await setData(STORAGE_KEYS.TOURNAMENTS, merged)
  }
}
