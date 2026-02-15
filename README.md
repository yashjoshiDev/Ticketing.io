# 🎟️ Ticketing.io

## 🛠️ Current Status (Phase 4 Complete: Connected Microservices)
* **Architecture:**
    * [x] **Auth Service (Port 4000):** Handles Users, JWTs, and Cookies.
    * [x] **Tickets Service (Port 5000):** Handles Ticket creation/fetching.
    * [x] **Frontend (Port 3000):** Next.js App Router for UI.
* **Security & Identity:**
    * [x] **Shared Identity:** Ticket Service can read Auth Cookies to identify users.
    * [x] **Route Protection:** `requireAuth` middleware blocks non-logged-in users.
* **Data Flow:**
    * [x] **Create Ticket:** Frontend -> Ticket Service (Authenticated).
    * [x] **Read Tickets:** Frontend -> Ticket Service (Public).

## ⏭️ Next Session Goals
1.  **Phase 5: Release Management (Requested)**
    * [ ] Learn Git Tags (`git tag v1.0.0`).
    * [ ] Manage GitHub Releases & Changelogs.
    * [ ] Semantic Versioning strategy.
2.  **Phase 6: Event Bus (NATS)**
    * [ ] Connect Ticket Service to NATS Streaming.