/**
 * Helper function to make authenticated API requests
 * Automatically includes JWT token from localStorage
 */
export async function apiRequest(url, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || "Request failed")
  }

  return response.json()
}

