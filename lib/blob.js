import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function uploadImage(file) {
  try {
    if (!file) {
      throw new Error("No file provided")
    }

    // Generate a unique filename
    const filename = `${nanoid()}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return {
      url: blob.url,
      success: true,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    return {
      error: error.message,
      success: false,
    }
  }
}
