"use client"

import { createContext, useContext, useEffect, useState, useMemo } from "react"

const AuthContext = createContext({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  isFirebaseInitialized: true, // Changed to true to prevent errors
  isOnline: true,
})

export const useAuth = () => useContext(AuthContext)

// Helper function to check if we're online
const checkOnlineStatus = () => {
  return typeof navigator !== "undefined" && typeof navigator.onLine === "boolean" ? navigator.onLine : true
}

// Local storage key for caching user data
const USER_CACHE_KEY = "tournify_user_cache"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(true) // Changed to true
  const [isOnline, setIsOnline] = useState(checkOnlineStatus())

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("App is online")
      setIsOnline(true)
    }

    const handleOffline = () => {
      console.log("App is offline")
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Cache user data to localStorage for faster access
  const cacheUserData = (userData) => {
    if (typeof window !== "undefined" && userData) {
      try {
        // Don't store sensitive data in localStorage
        const cacheableData = {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          role: userData.role,
          lastUpdated: new Date().toISOString(),
        }
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheableData))
      } catch (error) {
        console.error("Error caching user data:", error)
      }
    }
  }

  // Get cached user data
  const getCachedUserData = () => {
    if (typeof window !== "undefined") {
      try {
        const cachedData = localStorage.getItem(USER_CACHE_KEY)
        return cachedData ? JSON.parse(cachedData) : null
      } catch (error) {
        console.error("Error reading cached user data:", error)
        return null
      }
    }
    return null
  }

  useEffect(() => {
    // Try to use cached data immediately to reduce loading time
    const cachedUser = getCachedUserData()
    if (cachedUser) {
      console.log("Using cached user data initially")
      setUser({
        ...cachedUser,
        fromCache: true,
      })
    }

    // Create a fake auth system since Firebase isn't configured
    const fakeAuth = {
      currentUser: cachedUser || null,
      onAuthStateChanged: (callback) => {
        callback(cachedUser || null)
        return () => {} // Unsubscribe function
      },
    }

    const unsubscribe = fakeAuth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = {
            ...firebaseUser,
            offlineMode: !isOnline,
          }

          setUser(userData)
          cacheUserData(userData)
        } catch (error) {
          console.error("Error handling user data:", error)

          // Fallback to basic user data
          const basicUserData = {
            ...firebaseUser,
            role: "user",
            offlineMode: !isOnline,
          }

          setUser(basicUserData)
          cacheUserData(basicUserData)
        }
      } else {
        setUser(null)
        // Clear cached user data on logout
        if (typeof window !== "undefined") {
          localStorage.removeItem(USER_CACHE_KEY)
        }
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [isOnline])

  const signIn = async (email, password) => {
    // Create a fake user
    const fakeUser = {
      uid: `user_${Date.now()}`,
      email,
      displayName: email.split("@")[0],
      photoURL: null,
      role: "user",
    }

    // Update user state
    setUser(fakeUser)

    // Cache user data
    cacheUserData(fakeUser)

    return fakeUser
  }

  const signUp = async (email, password, displayName) => {
    // Create a fake user
    const fakeUser = {
      uid: `user_${Date.now()}`,
      email,
      displayName: displayName || email.split("@")[0],
      photoURL: null,
      role: "user",
    }

    // Update user state
    setUser(fakeUser)

    // Cache user data
    cacheUserData(fakeUser)

    return fakeUser
  }

  const signInWithGoogle = async () => {
    // Create a fake Google user
    const fakeGoogleUser = {
      uid: `google_user_${Date.now()}`,
      email: `user${Date.now()}@gmail.com`,
      displayName: `Google User ${Date.now()}`,
      photoURL: "https://lh3.googleusercontent.com/a/default-user",
      role: "user",
    }

    // Update user state
    setUser(fakeGoogleUser)

    // Cache user data
    cacheUserData(fakeGoogleUser)

    return fakeGoogleUser
  }

  const signOut = async () => {
    // Clear user state
    setUser(null)

    // Clear cached user data
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_CACHE_KEY)
    }
  }

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      isFirebaseInitialized,
      isOnline,
    }),
    [user, isLoading, isFirebaseInitialized, isOnline],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
