import { db, storage } from "./firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Create a new tournament
export const createTournament = async (tournamentData, userId) => {
  try {
    const tournamentRef = await addDoc(collection(db, "tournaments"), {
      ...tournamentData,
      organizerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      registeredTeams: 0,
      status: "upcoming",
    })

    return {
      id: tournamentRef.id,
      ...tournamentData,
      organizerId: userId,
    }
  } catch (error) {
    console.error("Error creating tournament:", error)
    throw error
  }
}

// Upload tournament banner image
export const uploadTournamentImage = async (file, tournamentId) => {
  try {
    const fileRef = ref(storage, `tournaments/${tournamentId}/${file.name}`)
    await uploadBytes(fileRef, file)
    const downloadURL = await getDownloadURL(fileRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading tournament image:", error)
    throw error
  }
}

// Get all tournaments
export const getAllTournaments = async (status = null) => {
  try {
    let q
    if (status) {
      q = query(collection(db, "tournaments"), where("status", "==", status), orderBy("createdAt", "desc"))
    } else {
      q = query(collection(db, "tournaments"), orderBy("createdAt", "desc"))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting tournaments:", error)
    throw error
  }
}

// Get tournaments by organizer
export const getOrganizerTournaments = async (organizerId) => {
  try {
    const q = query(
      collection(db, "tournaments"),
      where("organizerId", "==", organizerId),
      orderBy("createdAt", "desc"),
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting organizer tournaments:", error)
    throw error
  }
}

// Get tournament by ID
export const getTournamentById = async (tournamentId) => {
  try {
    const tournamentDoc = await getDoc(doc(db, "tournaments", tournamentId))

    if (!tournamentDoc.exists()) {
      throw new Error("Tournament not found")
    }

    return {
      id: tournamentDoc.id,
      ...tournamentDoc.data(),
    }
  } catch (error) {
    console.error("Error getting tournament:", error)
    throw error
  }
}

// Update tournament
export const updateTournament = async (tournamentId, tournamentData) => {
  try {
    const tournamentRef = doc(db, "tournaments", tournamentId)
    await updateDoc(tournamentRef, {
      ...tournamentData,
      updatedAt: serverTimestamp(),
    })

    return {
      id: tournamentId,
      ...tournamentData,
    }
  } catch (error) {
    console.error("Error updating tournament:", error)
    throw error
  }
}

// Delete tournament
export const deleteTournament = async (tournamentId) => {
  try {
    await deleteDoc(doc(db, "tournaments", tournamentId))
    return true
  } catch (error) {
    console.error("Error deleting tournament:", error)
    throw error
  }
}

// Register for tournament
export const registerForTournament = async (tournamentId, registrationData, userId) => {
  try {
    // Add registration to registrations collection
    const registrationRef = await addDoc(collection(db, "registrations"), {
      tournamentId,
      userId,
      ...registrationData,
      status: "pending", // pending, approved, rejected
      createdAt: serverTimestamp(),
    })

    // Update tournament registered teams count
    const tournamentRef = doc(db, "tournaments", tournamentId)
    const tournamentDoc = await getDoc(tournamentRef)

    if (tournamentDoc.exists()) {
      await updateDoc(tournamentRef, {
        registeredTeams: (tournamentDoc.data().registeredTeams || 0) + 1,
      })
    }

    return {
      id: registrationRef.id,
      tournamentId,
      userId,
      ...registrationData,
    }
  } catch (error) {
    console.error("Error registering for tournament:", error)
    throw error
  }
}

// Get user registrations
export const getUserRegistrations = async (userId) => {
  try {
    const q = query(collection(db, "registrations"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting user registrations:", error)
    throw error
  }
}

// Get tournament registrations
export const getTournamentRegistrations = async (tournamentId) => {
  try {
    const q = query(
      collection(db, "registrations"),
      where("tournamentId", "==", tournamentId),
      orderBy("createdAt", "desc"),
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting tournament registrations:", error)
    throw error
  }
}

// Update registration status
export const updateRegistrationStatus = async (registrationId, status) => {
  try {
    const registrationRef = doc(db, "registrations", registrationId)
    await updateDoc(registrationRef, {
      status,
      updatedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error updating registration status:", error)
    throw error
  }
}
