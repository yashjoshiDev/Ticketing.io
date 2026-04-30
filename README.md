# Ticketing.io

A production-grade, event-driven ticketing marketplace built with a microservices architecture. Users can list event tickets for sale, browse available listings, and reserve tickets through an order management system with automatic expiration.

[![Deploy](https://github.com/yashjoshiDev/Ticketing.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/yashjoshiDev/Ticketing.io/actions/workflows/deploy.yml)

---

## Architecture Overview

Ticketing.io is not a monolith. It is composed of **5 independent services** that communicate over two channels:

- **TCP (request/response)** — the API Gateway sends commands to microservices and waits for a reply
- **NATS (publish/subscribe)** — microservices emit events that other services react to asynchronously

```
                        ┌─────────────────────────────────────┐
                        │           Client (Next.js)           │
                        │         Deployed on Vercel           │
                        └──────────────┬──────────────────────┘
                                       │ HTTPS
                        ┌──────────────▼──────────────────────┐
                        │         API Gateway (NestJS)         │
                        │  Single HTTP entry point — port 8000 │
                        └───┬──────────────┬──────────────┬───┘
                            │ TCP          │ TCP          │ TCP
               ┌────────────▼───┐  ┌───────▼──────┐  ┌───▼──────────┐
               │  Auth Service  │  │   Tickets    │  │    Orders    │
               │   port 4000    │  │   Service    │  │   Service    │
               │                │  │  port 5000   │  │  port 6000   │
               └────────────────┘  └──────┬───────┘  └──────┬───────┘
                                          │                  │
                                          └────────┬─────────┘
                                                   │ NATS Events
                                        ┌──────────▼──────────┐
                                        │    NATS Server       │
                                        │  (Event Bus)         │
                                        └─────────────────────┘
                                                   │
                                        ┌──────────▼──────────┐
                                        │      MongoDB         │
                                        │  (per-service DB)    │
                                        └─────────────────────┘
```

### Why microservices?

Each service owns its data and can be deployed, scaled, and failed independently. If the Orders service crashes, users can still browse and list tickets. The event bus (NATS) ensures data stays consistent across service boundaries without tight coupling.

---

## Services

### API Gateway
- **Port:** 8000
- **Role:** The only public-facing backend service. Accepts HTTP requests, authenticates users via JWT cookies, and routes commands to the correct microservice over TCP.
- **Key features:** Helmet security headers, CORS, rate limiting (ThrottlerModule), global validation pipe, JWT auth guard

### Auth Service
- **Port:** 4000 (TCP only — never exposed publicly)
- **Role:** Handles user registration, login, and token verification. Passwords are hashed using Node.js `crypto.scrypt` with a 16-byte salt.
- **Message patterns:** `signup`, `signin`, `currentuser`

### Tickets Service
- **Port:** 5000 (TCP + NATS)
- **Role:** Creates and manages ticket listings. Publishes events when tickets change so other services stay in sync.
- **Events published:** `ticket:created`, `ticket:updated`
- **Concurrency:** Optimistic concurrency control via Mongoose version fields — prevents race conditions on concurrent updates

### Orders Service
- **Port:** 6000 (TCP + NATS)
- **Role:** Manages ticket reservations. When an order is created, it locks the ticket for 15 minutes. Maintains a local shadow copy of tickets (synced from NATS events) to avoid cross-service DB queries.
- **Order states:** `created` → `awaiting:payment` → `complete` / `cancelled`
- **Events consumed:** `ticket:created`, `ticket:updated`

### Client (Next.js)
- **Deployed on:** Vercel (auto-deploys on every push to `main`)
- **Pages:** Home, Sign Up, Sign In, Browse Tickets, Ticket Detail + Purchase, My Orders
- **Auth:** Session cookies with `credentials: include` — no client-side token storage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, TypeScript |
| Backend | NestJS 11, TypeScript |
| Database | MongoDB 7 (Mongoose ODM) |
| Event Bus | NATS (pub/sub messaging) |
| Auth | JWT (jsonwebtoken), cookie-session |
| Validation | class-validator, class-transformer |
| Security | Helmet, CORS, scrypt hashing, ThrottlerModule |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Container Registry | GitHub Container Registry (ghcr.io) |
| Frontend Hosting | Vercel |
| Backend Hosting | AWS EC2 (eu-north-1) |

---

## Key Engineering Decisions

### 1. Event-Driven Data Synchronization
Rather than the Orders service making a live TCP call to Tickets every time it needs ticket data, it maintains its own local copy synced via NATS events. This pattern (called **Event Sourcing / CQRS-lite**) makes Orders resilient — it works even if the Tickets service is temporarily down.

### 2. Optimistic Concurrency Control
Tickets use Mongoose's `optimisticConcurrency: true` with a `version` field. Before updating a synced ticket, the Orders service checks `version - 1`. If another process updated it first, the version won't match and the update is rejected — preventing silent data corruption in a distributed system.

### 3. API Gateway Pattern
All client traffic enters through a single gateway. Microservices are never exposed directly to the internet — they only accept TCP connections from within the Docker network. This gives a clean security boundary and a single place to add cross-cutting concerns (auth, rate limiting, logging).

### 4. CI/CD — Build in CI, Deploy Pre-built Images
Docker images are built in GitHub Actions (with GHA layer caching) and pushed to GitHub Container Registry. The EC2 instance only runs `docker compose pull && docker compose up -d` — no TypeScript compilation on the server. Deployments go from >10 minutes to under 2 minutes.

---

## CI/CD Pipeline

```
Push to main
     │
     ▼
┌─────────────────────────────────────────┐
│         build-and-push job              │
│                                         │
│  Build auth image    → push to ghcr.io  │
│  Build tickets image → push to ghcr.io  │
│  Build orders image  → push to ghcr.io  │
│  Build gateway image → push to ghcr.io  │
│                                         │
│  (Docker layer cache via GHA cache)     │
└─────────────────┬───────────────────────┘
                  │ on success
                  ▼
┌─────────────────────────────────────────┐
│            deploy job                   │
│                                         │
│  SSH into EC2                           │
│  git pull origin main                   │
│  docker login ghcr.io                   │
│  docker compose pull   ← pre-built      │
│  docker compose up -d  ← no build       │
└─────────────────────────────────────────┘

Vercel auto-deploys client/ on every push (separate pipeline)
```

---

## API Reference

All routes go through the API Gateway at `http://localhost:8000`.

### Auth
| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| `POST` | `/api/users/signup` | — | `{ email, password }` | Create account |
| `POST` | `/api/users/signin` | — | `{ email, password }` | Sign in, sets JWT cookie |
| `POST` | `/api/users/signout` | — | — | Clears session cookie |
| `GET` | `/api/users/currentuser` | — | — | Returns current user from JWT |

### Tickets
| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| `GET` | `/api/tickets` | — | — | List all tickets (paginated) |
| `POST` | `/api/tickets` | Required | `{ title, price }` | Create a ticket listing |

### Orders
| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| `GET` | `/api/orders` | Required | — | List current user's orders |
| `POST` | `/api/orders` | Required | `{ ticketId }` | Reserve a ticket (15 min expiry) |

---

## Running Locally

### Prerequisites
- Docker and Docker Compose
- Node.js 22+

### 1. Clone the repo
```bash
git clone https://github.com/yashjoshiDev/Ticketing.io.git
cd Ticketing.io
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and replace the placeholder values:
```env
JWT_SECRET=your-strong-secret-here
COOKIE_SECRET=another-strong-secret
```

### 3. Start all backend services
```bash
docker compose up --build -d
```

This starts: MongoDB, NATS, Auth, Tickets, Orders, and the API Gateway.

### 4. Start the frontend
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Swagger API Docs
[http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## Project Structure

```
Ticketing.io/
├── api-gateway/          # NestJS HTTP gateway — public entry point
│   └── src/
│       ├── guards/       # JwtAuthGuard
│       ├── dto/          # Request validation schemas
│       └── common/       # Global exception filter
├── auth/                 # Auth microservice (TCP)
│   └── src/
│       ├── dto/          # SignupDto, SigninDto
│       ├── schemas/      # Mongoose User schema
│       └── utils/        # Password hashing (scrypt)
├── tickets/              # Tickets microservice (TCP + NATS)
│   └── src/
│       ├── dto/
│       └── schemas/      # Ticket schema with optimistic concurrency
├── orders/               # Orders microservice (TCP + NATS)
│   └── src/
│       ├── dto/
│       └── schemas/      # Order schema, shadow Ticket schema
├── client/               # Next.js 16 frontend (deployed on Vercel)
│   └── src/
│       ├── app/          # App Router pages
│       ├── components/   # Navbar
│       ├── context/      # AuthContext (global auth state)
│       └── lib/          # apiFetch wrapper
├── .github/workflows/    # GitHub Actions CI/CD
├── docker-compose.yaml   # Full stack orchestration (backend only)
└── .env.example          # Environment variable template
```

---

## Environment Variables

| Variable | Service | Description |
|---|---|---|
| `JWT_SECRET` | auth | Secret key for signing JWT tokens |
| `COOKIE_SECRET` | api-gateway | Key for signing session cookies |
| `MONGO_URI_AUTH` | auth | MongoDB connection string |
| `MONGO_URI_TICKETS` | tickets | MongoDB connection string |
| `MONGO_URI_ORDERS` | orders | MongoDB connection string |
| `NATS_SERVERS` | tickets, orders | NATS connection URL |
| `AUTH_HOST` | api-gateway | Hostname of auth service |
| `TICKETS_HOST` | api-gateway | Hostname of tickets service |
| `ORDERS_HOST` | api-gateway | Hostname of orders service |
| `CLIENT_URL` | api-gateway | Frontend origin for CORS |
| `NEXT_PUBLIC_API_URL` | client | API Gateway URL |

---

## Security

- Passwords hashed with `scrypt` (16-byte salt)
- JWT tokens stored in signed, `httpOnly` session cookies — not accessible to JavaScript
- `secure: true` cookies enforced in production (HTTPS only)
- Helmet adds secure HTTP response headers
- Rate limiting on all routes via `@nestjs/throttler`
- Input validation with `class-validator` on all endpoints
- Microservices only accept TCP connections from within the Docker bridge network — never exposed to the internet

---

## What's Next

- [ ] Stripe payment integration — complete the `awaiting:payment` → `complete` flow
- [ ] Worker service — auto-cancel expired orders via a background job (BullMQ)
- [ ] WebSocket notifications — real-time order status updates
- [ ] Ticket search and filtering
- [ ] Seller dashboard with order analytics
