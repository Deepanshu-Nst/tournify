# Auth, Database, and Hosting Setup

## 1) Environment Variables
Create a `.env` in the project root:

```
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-strong-random"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## 2) Install and Migrate
```
npm install
npx prisma generate
npx prisma migrate dev --name init
```

## 3) Run Locally
```
npm run dev
```

Or with Docker (includes MySQL):
```
docker compose up --build
```

## 4) Deploy Options
- Vercel + PlanetScale/Railway MySQL
- Render/Fly.io + Managed MySQL

Set env vars in your host and run `npx prisma migrate deploy` on deploy.

## 5) Credentials Login/Signup
- POST `/api/auth/signup` with `{ name, email, password }`
- Login via the UI uses NextAuth Credentials provider.

## 6) Google OAuth (optional)
- Add OAuth credentials and set the two Google env vars.
- Add callback `NEXTAUTH_URL/api/auth/callback/google`.


