"use client"

import { createContext, useContext, useMemo, useState, useEffect } from "react"

const AuthContext = createContext({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  token: null,
  isFirebaseInitialized: true,
  isOnline: true,
})

export const useAuth = () => useContext(AuthContext)

// Helper to get token from localStorage
const getStoredToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

// Helper to store token in localStorage
const setStoredToken = (token) => {
  if (typeof window === "undefined") return
  if (token) {
    localStorage.setItem("token", token)
  } else {
    localStorage.removeItem("token")
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = getStoredToken()
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      setToken(storedToken)
      try {
        const resp = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
        if (resp.ok) {
          const data = await resp.json()
          setUser(data.user)
        } else {
          // Token is invalid, remove it
          setStoredToken(null)
          setToken(null)
        }
      } catch (error) {
        console.error("Error loading user:", error)
        setStoredToken(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const signIn = async (email, password) => {
    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await resp.json()
    if (!resp.ok) {
      const message = data?.error || "Login failed"
      const err = new Error(message)
      err.code = resp.status
      throw err
    }

    // Store token and user
    setStoredToken(data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const signUp = async (email, password, displayName) => {
    const resp = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: displayName, email, password }),
    })
    const data = await resp.json()
    if (!resp.ok) {
      const message = data?.error || "Signup failed"
      const err = new Error(message)
      err.code = resp.status
      throw err
    }

    // Store token and user
    setStoredToken(data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const signOut = async () => {
    setStoredToken(null)
    setToken(null)
    setUser(null)
  }

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      token,
      isFirebaseInitialized: true,
      isOnline: true,
    }),
    [user, isLoading, token],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
