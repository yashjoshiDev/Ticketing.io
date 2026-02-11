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

## ⏭️ Next Task: Phase 5 (NATS Streaming & Orders)
**Goal:** We need to handle "Buying" a ticket.
1.  **Order Service:** A new microservice to manage orders.
2.  **Event Bus (NATS):** We need a way for the Ticket Service to tell the Order Service: *"Hey! Ticket #123 was just updated!"* without them crashing if one is offline.