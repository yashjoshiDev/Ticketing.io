# 🎟️ Scalable Event Ticketing Platform

## 🛠️ Current Status (Phase 4: Ticket Service Prototype)
* **Microservices Architecture:**
    * [x] **Auth Service:** Port 4000 (Postgres + Prisma).
    * [x] **Tickets Service:** Port 5000 (MongoDB + Mongoose).
* **Functionality:**
    * [x] **Auth:** Signup, Signin, Signout (via Cookies & JWT).
    * [x] **Tickets:** Can create (`POST`) and fetch (`GET`) tickets.
* **Connectivity:**
    * [x] MongoDB running in Docker on Port 27017.
    * [x] Tickets Service successfully connecting to MongoDB.
* **Pending:**
    * [ ] **Identity Sync:** Ticket Service currently uses a "fake" User ID. It needs to read the JWT from the Auth Service to know who the real user is.

## ⏭️ Next Task: Shared Logic
**Goal:** Teach the Ticket Service how to read the Auth Service's "ID Card" (JWT).
1.  Copy the `currentUser` middleware from Auth to Tickets.
2.  Update the Ticket Model to use the real `req.currentUser.id`.
3.  Lock down the "Create Ticket" route so only logged-in users can access it.