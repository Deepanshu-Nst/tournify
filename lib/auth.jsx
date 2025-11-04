"use client"

import { createContext, useContext, useMemo } from "react"
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession, signIn } from "next-auth/react"

const AuthContext = createContext({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  isFirebaseInitialized: true,
  isOnline: true,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession()

  const signInWithCredentials = async (email, password) => {
    const res = await nextAuthSignIn("credentials", {
      redirect: false,
      email,
      password,
    })
    if (res?.error) throw new Error(res.error)
    return res
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
    // auto sign-in after signup
    await signInWithCredentials(email, password)
    return data
  }

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false })
  }

  const signInWithGoogle = async () => {
    await signIn("google")
  }

  const contextValue = useMemo(
    () => ({
      user: session?.user || null,
      isLoading: status === "loading",
      signIn: signInWithCredentials,
      signUp,
      signOut,
      signInWithGoogle,
      isFirebaseInitialized: true,
      isOnline: true,
    }),
    [session?.user, status],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
