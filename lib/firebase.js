import { initializeApp, getApps } from "firebase/app"
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

// Check if Firebase environment variables are available
const hasFirebaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

// Your Firebase configuration
const firebaseConfig = hasFirebaseConfig
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
  : {
      // Fallback config for development (replace with your dev project if needed)
      apiKey: "AIzaSyDummyKeyForDevEnvironment",
      authDomain: "tournify-dev.firebaseapp.com",
      projectId: "tournify-dev",
      storageBucket: "tournify-dev.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef1234567890",
    }

// Initialize Firebase only if it hasn't been initialized already
let app
let auth
let db

if (typeof window !== "undefined") {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    auth = getAuth(app)
    db = getFirestore(app)

    // Set persistence for faster auth
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Error setting auth persistence:", error)
    })

    // Use emulators in development if needed
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
      connectAuthEmulator(auth, "http://localhost:9099")
      connectFirestoreEmulator(db, "localhost", 8080)
    }

    console.log("Firebase Auth initialized successfully")
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

export { app, auth, db }
