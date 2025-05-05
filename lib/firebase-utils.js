import { db } from "./firebase"
import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore"

// Cache for storing fetched data
const cache = {
  tournaments: new Map(),
  users: new Map(),
  registrations: new Map(),
}

// Cache expiration time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000

/**
 * Get a document with caching
 */
export async function getCachedDoc(collectionName, docId) {
  const cacheKey = `${collectionName}/${docId}`
  const cachedItem = cache[collectionName]?.get(docId)

  // Return cached item if it exists and hasn't expired
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRY) {
    return cachedItem.data
  }

  // Fetch from Firestore
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() }

      // Cache the result
      if (!cache[collectionName]) {
        cache[collectionName] = new Map()
      }
      cache[collectionName].set(docId, { data, timestamp: Date.now() })

      return data
    }
    return null
  } catch (error) {
    console.error(`Error fetching ${collectionName}/${docId}:`, error)
    throw error
  }
}

/**
 * Get documents from a collection with caching
 */
export async function getCachedCollection(collectionName, queryConstraints = []) {
  // Create a unique key for this query
  const queryKey = JSON.stringify(queryConstraints)
  const cachedItems = cache[collectionName]?.get(queryKey)

  // Return cached items if they exist and haven't expired
  if (cachedItems && Date.now() - cachedItems.timestamp < CACHE_EXPIRY) {
    return cachedItems.data
  }

  // Fetch from Firestore
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, ...queryConstraints)
    const querySnapshot = await getDocs(q)

    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Cache the results
    if (!cache[collectionName]) {
      cache[collectionName] = new Map()
    }
    cache[collectionName].set(queryKey, { data, timestamp: Date.now() })

    return data
  } catch (error) {
    console.error(`Error fetching ${collectionName} collection:`, error)
    throw error
  }
}

/**
 * Clear specific cache entries
 */
export function clearCache(collectionName, docId = null) {
  if (docId) {
    cache[collectionName]?.delete(docId)
  } else {
    cache[collectionName]?.clear()
  }
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  Object.keys(cache).forEach((key) => {
    cache[key].clear()
  })
}

/**
 * Get tournaments with optimized loading
 */
export async function getOptimizedTournaments(constraints = []) {
  return getCachedCollection("tournaments", [orderBy("createdAt", "desc"), ...constraints])
}

/**
 * Get tournament by ID with optimized loading
 */
export async function getOptimizedTournament(tournamentId) {
  return getCachedDoc("tournaments", tournamentId)
}

/**
 * Get user tournaments with optimized loading
 */
export async function getOptimizedUserTournaments(userId) {
  return getCachedCollection("tournaments", [where("organizerId", "==", userId), orderBy("createdAt", "desc")])
}

/**
 * Get tournament registrations with optimized loading
 */
export async function getOptimizedTournamentRegistrations(tournamentId) {
  return getCachedCollection("registrations", [where("tournamentId", "==", tournamentId), orderBy("createdAt", "desc")])
}

/**
 * Get user registrations with optimized loading
 */
export async function getOptimizedUserRegistrations(userId) {
  return getCachedCollection("registrations", [where("userId", "==", userId), orderBy("createdAt", "desc")])
}
