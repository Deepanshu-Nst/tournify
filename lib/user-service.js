import {
  getUserProfile as getStoredUserProfile,
  updateUserProfile as updateStoredUserProfile,
  getUserRegistrations as getStoredUserRegistrations,
} from "./server-storage"
import { getTournamentById } from "./tournament-service"

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userProfile = await getStoredUserProfile(userId)

    if (!userProfile) {
      throw new Error("User not found")
    }

    return userProfile
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    return await updateStoredUserProfile(userId, profileData)
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Get user registrations with tournament details
export const getUserRegistrationsWithDetails = async (userId) => {
  try {
    // Get user registrations
    const registrations = await getStoredUserRegistrations(userId)

    // Get tournament details for each registration
    const registrationsWithDetails = await Promise.all(
      registrations.map(async (registration) => {
        try {
          const tournament = await getTournamentById(registration.tournamentId)

          if (tournament) {
            return {
              ...registration,
              tournament: {
                id: tournament.id,
                ...tournament,
              },
            }
          }

          return {
            ...registration,
            tournament: { id: registration.tournamentId, title: "Unknown Tournament" },
          }
        } catch (error) {
          console.error(`Error getting tournament ${registration.tournamentId}:`, error)
          return {
            ...registration,
            tournament: { id: registration.tournamentId, title: "Unknown Tournament" },
          }
        }
      }),
    )

    return registrationsWithDetails
  } catch (error) {
    console.error("Error getting user registrations:", error)
    throw error
  }
}
