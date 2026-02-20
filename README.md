# Ticketing.io - NestJS Microservices Migration

## 🏗️ Architecture Overview

* **API Gateway (Port 8000):** The public entry point; handles HTTP requests, session management via `cookie-session`, and proxies requests via **TCP**.

* **Auth Microservice (TCP Port 4000):** Manages users, secure `scrypt` hashing, and auth logic.

* **Tickets Microservice (TCP Port 5000):** Handles ticket CRUD operations.

* **Orders Microservice (TCP Port 6000):** Manages reservations, order statuses, and 15-minute expiration timers.



## 🎯 Next Session Goals



### 1. Phase 5: Release Management

* **Git Tags:** Implement `git tag v1.0.0` to snapshot stable builds.

* **GitHub Releases:** Automate changelog generation to track microservice updates.

* **Semantic Versioning:** Adopt a `MAJOR.MINOR.PATCH` strategy for cross-service compatibility.



### 2. Phase 6: Event Bus (NATS)

* **NATS Integration:** Connect the **Tickets** service to NATS Streaming.

* **Real-time Sync:** Emit a `TicketCreated` event from the **Tickets** service and listen for it in the **Orders** service to update the "Shadow" collection automatically.



### 3. Expiration & Payments

* **Expiration Service:** Build a dedicated worker for 15-minute order cleanup.

* **Payment Service:** Integrate Stripe for completing order transactions.