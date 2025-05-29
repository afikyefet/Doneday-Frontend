# Monday.com Clone – Full‑Stack Project

A robust project‑management platform inspired by Monday.com, built from the ground up by a three‑person team as the capstone of our Coding Academy full‑stack bootcamp. It delivers real‑time collaboration, flexible boards, and a clean, modern UI that mirrors—and even improves on—the Monday.com experience while remaining **100 % open‑source**.

---

## Table of Contents
1. [Key Features](#key-features)  
2. [Tech Stack](#tech-stack)  
3. [Architecture Overview](#architecture-overview)  
4. [Getting Started](#getting-started)  
5. [Project Structure](#project-structure)  
6. [Environment Variables](#environment-variables)  
7. [Scripts](#scripts)  
8. [Data Model](#data-model)  
9. [Roadmap](#roadmap)  
10. [Contributing](#contributing)  
11. [License](#license)  

---

## Key Features
- **Drag‑and‑Drop Boards** – Smoothly reorder groups, tasks, and subtasks with DnD Kit and fine‑tuned React memoization for zero‑lag interaction.  
- **Nested Structure** – Boards → groups → tasks → checklists → comments, giving teams all the hierarchy they need without the clutter they don’t.  
- **Real‑Time Sync** – Socket.IO streams updates the moment they happen, so every teammate sees the same board, the same second.  
- **Customizable Columns** – Status, priority, owner, timeline, tags, and any extra fields you define.  
- **Advanced Filters & Search** – Slice data by status, assignee, or free‑text with instant results.  
- **Activity Log** – Full audit trail stored in MongoDB so nothing slips through the cracks.  
- **Responsive UI** – SASS modules and CSS Grid keep things pixel‑perfect from 4‑K desktops to mobile browsers.  
- **Authentication & RBAC** – JSON Web Tokens, salted + hashed passwords, and role‑based access (admin, member, guest).  
- **Socket‑Powered Notifications** – Real‑time toast alerts when tasks move, deadlines change, or mentions appear.  
- **Dark Mode** – Because late‑night sprints happen.

---

## Tech Stack

| Layer        | Technology                                                             |
|--------------|------------------------------------------------------------------------|
| **Frontend** | React 18 • Redux Toolkit • React Router v6 • DnD Kit • SASS Modules    |
| **Backend**  | Node.js 20 • Express 5 • Socket.IO 4                                   |
| **Database** | MongoDB Atlas • Mongoose 7                                             |
| **Dev Ops**  | Vite 5 • ESLint (Airbnb) • Prettier • Husky & lint‑staged • Vitest     |
| **Deployment** | Render (server) • Vercel (client)                                   |

---

## Architecture Overview
```
┌──────────────┐        Socket.IO        ┌─────────────┐
│   React UI   │  ←───────────────→  │   Node API   │
└──────┬───────┘                       └──────┬──────┘
       │ REST / WS                            │ Mongoose
       ▼                                      ▼
┌───────────────────────────┐      ┌──────────────────┐
│         Browser           │      │   MongoDB Atlas  │
└───────────────────────────┘      └──────────────────┘
```
- Front‑end state lives in **Redux**.  
- Real‑time events travel via **Socket.IO** channels keyed by board ID.  
- Server validates mutations, persists to MongoDB, then broadcasts deltas.

---

## Getting Started

### Prerequisites
- **Node 20 LTS**  
- **Yarn 1.22+** (or npm 10+)  
- A **MongoDB Atlas** account (free tier is fine)

### Installation
```bash
# 1 · Clone
git clone https://github.com/YOUR_USERNAME/monday-clone.git
cd monday-clone

# 2 · Install dependencies
yarn && yarn --cwd client

# 3 · Create .env files
cp server/.env.sample server/.env
cp client/.env.sample client/.env
# then add your values (see below)

# 4 · Seed demo data (optional)
yarn seed

# 5 · Run dev servers concurrently
yarn dev
```
The client runs at **<http://localhost:5173>** and the API at **<http://localhost:3030>**.

---

## Project Structure
```
.
├── client/            # React app
│   ├── assets/
│   ├── components/
│   ├── features/      # Redux slices
│   ├── hooks/
│   ├── pages/
│   └── styles/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── socket/
└── docs/              # screenshots & architecture diagrams
```

---

## Environment Variables

| Key                | Default                     | Description                         |
|--------------------|-----------------------------|-------------------------------------|
| `VITE_API_BASE_URL`| `/api`                      | Client → Server proxy base          |
| `MONGO_URI`        | —                           | MongoDB connection string           |
| `JWT_SECRET`       | —                           | Token signing key                   |
| `CLIENT_ORIGIN`    | `http://localhost:5173`     | CORS & cookie origin                |
| `PORT`             | `3030`                      | Express port                        |

---

## Scripts

| Command        | Purpose                                   |
|----------------|-------------------------------------------|
| `yarn dev`     | Start server & client with hot‑reload     |
| `yarn build`   | Build client for production               |
| `yarn start`   | Serve compiled client & API               |
| `yarn seed`    | Populate demo users, boards, tasks        |
| `yarn test`    | Run unit & component tests                |
| `yarn lint`    | Run ESLint + Prettier checks              |

---

## Data Model (simplified)
```js
Board {
  _id: ObjectId,
  title: String,
  members: [UserRef],
  groups: [Group],
  activityLog: [Activity],
  // …
}

Group {
  id: String,
  title: String,
  tasks: [Task]
}

Task {
  id: String,
  title: String,
  status: 'Done' | 'Working on it' | 'Stuck' | …,
  priority: 'Low' | 'Medium' | 'High',
  timeline: { start: Date, end: Date },
  assignees: [UserRef],
  comments: [Comment],
  checklists: [ChecklistItem]
}
```
_All IDs inside a board are **UUID v4** strings for fast in‑memory diffing._

---

## Roadmap
- [ ] **Gantt View** – visualize timelines across boards  
- [ ] **Public Links** – share read‑only boards with clients  
- [ ] **OAuth 2.0** – Google & GitHub SSO  
- [ ] **Microservices Split** – queue‑driven notifications service  
- [ ] **i18n** – Hebrew and Spanish locales  

---

## Contributing
Pull requests are welcome! Please open an issue first to discuss major changes.

1. **Fork** the repo  
2. Create a feature branch: `git checkout -b feat/awesome-thing`  
3. Commit with **Conventional Commits**  
4. Run `yarn lint && yarn test` – no red allowed  
5. Push and open a PR

---

## License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

> Made with late‑night coffee and a lot of `console.log` by **Afik Yefet** and teammates. If you spin this up, show us what you build!
