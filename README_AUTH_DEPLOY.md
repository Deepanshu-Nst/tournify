# Auth, Database, and Hosting Setup

## 1) Environment Variables
Create a `.env` in the project root:

```
DATABASE_URL="mongodb://localhost:27017/tournify"
# Or with authentication:
# DATABASE_URL="mongodb://username:password@localhost:27017/tournify"
# Or for MongoDB Atlas (cloud):
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/tournify"

# JWT Secret for token signing (use a strong random string)
# Generate one with: openssl rand -base64 32
JWT_SECRET="your-strong-secret-key-change-in-production"
# Or use NEXTAUTH_SECRET as fallback
NEXTAUTH_SECRET="replace-with-strong-random"

NEXTAUTH_URL="http://localhost:3000"
```

**Note:** Make sure MongoDB is running locally. You can start it with:
- macOS (Homebrew): `brew services start mongodb-community`
- Or use MongoDB Compass to connect and verify your connection

## 2) Install and Setup Database
```
npm install
npx prisma generate
npx prisma db push
```

**Note:** MongoDB doesn't use migrations like SQL databases. Use `prisma db push` to sync your schema with the database.

## 3) Run Locally
```
npm run dev
```

## 4) Deploy Options
- Vercel + MongoDB Atlas
- Render/Fly.io + MongoDB Atlas
- Any hosting with MongoDB Atlas connection

Set env vars in your host with your MongoDB connection string.

## 5) JWT Authentication

The application uses JWT (JSON Web Tokens) for authentication. Tokens are:
- Generated on signup/login
- Stored in browser localStorage
- Sent in `Authorization: Bearer <token>` header for API requests
- Valid for 7 days by default

### API Endpoints:
- **POST `/api/auth/signup`** - Create account
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
  Returns: `{ user: {...}, token: "jwt-token" }`

- **POST `/api/auth/login`** - Login
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
  Returns: `{ user: {...}, token: "jwt-token" }`

- **GET `/api/auth/me`** - Get current user (requires Authorization header)
  Headers: `Authorization: Bearer <token>`
  Returns: `{ user: {...} }`

### JWT Token Structure:
The JWT token contains:
- `id` - User ID
- `email` - User email
- `name` - User name
- `image` - User image URL (optional)
- `iat` - Issued at timestamp
- `exp` - Expiration timestamp
- `iss` - Issuer: "tournify"
- `aud` - Audience: "tournify-users"

You can decode and verify tokens at [jwt.io](https://jwt.io)

### Protected Routes:
- `/organizer/*` - Requires authentication
- `/profile` - Requires authentication
- `/settings` - Requires authentication
- `/dashboard` - Requires authentication
- `/api/tournaments/*` - Requires Authorization header


