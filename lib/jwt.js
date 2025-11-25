import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d" // 7 days default

/**
 * Generate a JWT token with user payload
 * @param {Object} payload - User data to include in token
 * @param {string} payload.id - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.name - User name
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    image: payload.image,
    // iat and exp will be automatically added by jwt.sign when expiresIn is used
  }

  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN, // This will automatically add 'exp' to the payload
    issuer: "tournify",
    audience: "tournify-users",
  })
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "tournify",
      audience: "tournify-users",
    })
    return decoded
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired")
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token")
    } else {
      throw new Error("Token verification failed")
    }
  }
}

/**
 * Extract token from Authorization header
 * @param {Request} request - Next.js request object
 * @returns {string|null} Token or null if not found
 */
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return null

  // Support both "Bearer <token>" and just "<token>"
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.substring(7) 
    : authHeader

  return token
}

/**
 * Get user from JWT token in request
 * @param {Request} request - Next.js request object
 * @returns {Object|null} User object or null if invalid/not found
 */
export async function getUserFromRequest(request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return null

    const decoded = verifyToken(token)
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      image: decoded.image,
    }
  } catch (error) {
    return null
  }
}

