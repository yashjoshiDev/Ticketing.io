# Ticketing.io - NestJS Microservices Migration

## 🏗️ Architecture Overview
* **API Gateway (Port 8000):** HTTP entry point; session management; TCP proxy.
* **Auth Service (TCP 4000):** User management and secure hashing.
* **Tickets Service (TCP 5000):** Ticket CRUD operations.
* **Orders Service (TCP 6000):** Reservation logic and expiration timers.

## 🎯 Next Session Goals

### 1. Phase 5: Release Management
* **Git Tags & SemVer:** Snapshot v1.0.0 and implement versioning.

### 2. Phase 6: Event Bus (NATS) & Concurrency
* **NATS Sync:** Real-time sync of "Shadow" collections.
* **OCC:** Version-based concurrency control in Mongoose.

### 3. Phase 7: Frontend Evolution (Next.js)
* **Performance:** Implement TanStack Query for caching.
* **UI/UX:** Build a live countdown timer for order expiration.
* **Validation:** Add client-side validation matching the backend schemas.

### 4. Expiration & Payments
* **Worker Service:** 15-minute cleanup via BullJS.
* **Stripe:** Integrated payment processing.