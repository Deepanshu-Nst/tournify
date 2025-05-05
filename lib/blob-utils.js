import { put } from "@vercel/blob"

// Check if Vercel Blob is properly configured
export function isBlobConfigured() {
  // The BLOB_READ_WRITE_TOKEN environment variable is automatically available
  // when the Blob integration is added to the project
  return typeof process !== "undefined" && !!process.env.BLOB_READ_WRITE_TOKEN
}

// Upload a file to Vercel Blob with fallback to data URL
export async function uploadToBlob(file, path) {
  if (!file) return null

  try {
    // Generate a unique filename
    const filename = `${path}/${Date.now()}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error)

    // Fallback to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error("Failed to read the file"))
      reader.readAsDataURL(file)
    })
  }
}
