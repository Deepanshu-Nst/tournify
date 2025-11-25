1. Project Title
Tournify — Event & Tournament Management Platform



2. Problem Statement
Organizing tournaments (sports, esports, community competitions) requires coordinating participants, schedules, registrations, and communications. Many organizers rely on fragmented tools (spreadsheets, chat apps, manual emails) which lead to errors, missed deadlines and poor attendee experience. Tournify aims to provide a single, easy-to-use platform for organizers and participants to create, manage, discover, and RSVP to tournaments.


Objectives:
- Provide an organizer-facing dashboard for event creation and management.
- Allow participants to discover events and RSVP.
- Persist events reliably and notify stakeholders (email notifications planned).
- Deliver a modern, responsive UI with a dark theme and good UX.



3. System Architecture
High-level flow:


Frontend (**MERN Stack (MongoDB, Express.js, React.js, Node.js)** / React)  →  Backend API (**MERN Stack (MongoDB, Express.js, React.js, Node.js)** API routes or Node/Express)  →  Database (Postgres / MongoDB)  →  Third-party services (Auth: Google via NextAuth, Email: SendGrid)


Components:
- Frontend (App Router): pages and client components built with **MERN Stack (MongoDB, Express.js, React.js, Node.js)** (React). Key pages: Home, Event Listing, Event Detail, Organizer Dashboard, Login.
- Auth: NextAuth.js using Google provider for login; session stored server-side/cookies.
- Backend API: **MERN Stack (MongoDB, Express.js, React.js, Node.js)** API routes (or an external Node API) for events CRUD, RSVP endpoints, and email webhook.
- Database: Document (MongoDB) or Relational (Postgres) to store Users, Events, RSVPs.
- Email service: SendGrid (planned) for notifications.
- Hosting: Frontend and API hosted on Vercel; database hosted on a cloud provider (MongoDB Atlas / ElephantSQL / Supabase).



4. Pages / Routes & Components
Pages (App Router `src/app`):
- / — Home (Hero, Featured Tournament, CTA)
- /tournaments — Listing / Search / Filters
- /event/[id] — Event detail + RSVP
- /organizer — Organizer dashboard (protected)
- /login — Sign-in page (Google sign-in via NextAuth)
- /dashboard — Organizer private dashboard (protected)


Main Components:
- Navbar, Footer, HeroSection, EventForm, EventList, EventCard, EventDetail, OrganizerDashboard, AuthProvider



5. Key Features (Minimum Viable Product)
Organizer Features:
- Create/Edit/Delete events (title, date, location, description, type, capacity).
- Organizer dashboard listing all managed events.
- View participant counts and RSVP list.


Participant Features:
- Browse and search tournaments (filter by date/location/type).
- View event details and RSVP.
- Optional: Register/login via Google.


Platform Features:
- Responsive dark-theme UI (professional challenge/tournament look).
- Local development persistence via localStorage (current dev); swap to DB for production.
- Email notifications (SendGrid) when events are created or when RSVPs occur (planned).
- Role-based access (organizer vs participant) via NextAuth sessions.



6. Tech Stack

This project is built using the **MERN Stack**, combining MongoDB, Express.js, React.js, and Node.js to ensure scalability, flexibility, and performance.
Frontend: **MERN Stack (MongoDB, Express.js, React.js, Node.js)** (App Router), React, Tailwind CSS / Custom CSS
Authentication: NextAuth.js (Google provider)
Backend / API: **MERN Stack (MongoDB, Express.js, React.js, Node.js)** API routes (Node) or separate Express service
Database: MongoDB Atlas or PostgreSQL (production)
Email: SendGrid (planned)
Hosting / CI: Vercel (frontend & API), DB on managed provider
Dev tools: GitHub, VS Code




8. API Overview (sample endpoints)
Endpoint | Method | Description | Access
/api/auth/[...nextauth] | GET/POST | NextAuth.js auth callbacks | Public
/api/events | GET | Get list of events (with search/filters) | Public
/api/events | POST | Create a new event | Organizer
/api/events/:id | GET | Event details | Public
/api/events/:id | PUT | Update event | Organizer
/api/events/:id | DELETE | Delete event | Organizer
/api/events/:id/rsvp | POST | RSVP for an event | Authenticated
/api/sendEmail | POST | Send notification emails (internal) | Server only
