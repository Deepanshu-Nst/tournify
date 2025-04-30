"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { auth, googleProvider } from "./firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "./firebase"

const AuthContext = createContext({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  //     if (firebaseUser) {
  //       // Get additional user data from Firestore
  //       try {
  //         const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
  //         if (userDoc.exists()) {
  //           setUser({
  //             ...firebaseUser,
  //             ...userDoc.data(),
  //           })
  //         } else {
  //           // Create user document if it doesn't exist
  //           const userData = {
  //             uid: firebaseUser.uid,
  //             email: firebaseUser.email,
  //             displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
  //             photoURL: firebaseUser.photoURL,
  //             role: "user", // Default role
  //             createdAt: new Date().toISOString(),
  //           }

  //           await setDoc(doc(db, "users", firebaseUser.uid), userData)
  //           setUser({
  //             ...firebaseUser,
  //             ...userData,
  //           })
  //         }
  //       } catch (error) {
  //         console.error("Error fetching user data:", error)
  //         setUser(firebaseUser)
  //       }
  //     } else {
  //       setUser(null)
  //     }
  //     setIsLoading(false)
  //   })

  //   return () => unsubscribe()
  // }, [])

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName })
      }

      // Create user document in Firestore
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName || email.split("@")[0],
        photoURL: userCredential.user.photoURL,
        role: "user", // Default role
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, "users", userCredential.user.uid), userData)

      return userCredential.user
    } catch (error) {
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
