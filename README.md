# 🐾 PetPooja Kanban Board

A simple drag-and-drop Kanban board built with the MERN stack
(MongoDB, Express, React, Node.js).

---

## What it does

- Three fixed columns: **To Do**, **In Progress**, **Done**
- Create, edit, and delete task cards
- Drag cards between columns or reorder them within a column
- Priority badges (Low / Medium / High) and free-form tags
- Toast notifications for every action

---

## Project structure

```
PetPooja/
├── client/          React front-end (Vite)
├── server/          Express + Mongoose API
├── package.json     Root scripts (runs both apps together)
└── .gitignore
```

---

## First-time setup (step by step)

> Do these steps **once** after cloning the repo.

### 1. Install Node.js

Download and install Node.js (v18 or newer) from https://nodejs.org.
Check it worked: `node -v` should print a version number.

### 2. Install MongoDB

**Option A – local:** Download MongoDB Community Edition from https://www.mongodb.com/try/download/community and run it.

**Option B – cloud (easier):** Create a free cluster on https://cloud.mongodb.com and copy the connection string.

### 3. Install dependencies

From the **root** folder of the project run:

```bash
npm install          # installs concurrently (runs both apps together)
npm install --prefix server   # installs Express, Mongoose, etc.
npm install --prefix client   # installs React, dnd-kit, etc.
```

### 4. Create environment files

**Server** – copy the example and fill in your values:
```bash
cp server/.env.example server/.env
```
Open `server/.env` and set `MONGODB_URI` to your MongoDB connection string.

**Client** – copy the example (the default value works for local development):
```bash
cp client/.env.example client/.env
```

### 5. (Optional) Seed the database with sample data

```bash
npm run seed --prefix server
```

---

## Running the apps

### Both apps together (recommended)
```bash
npm run dev
```
This starts the Express server **and** the React app at the same time.

### Individually
```bash
npm run dev --prefix server   # API at http://localhost:5000
npm run dev --prefix client   # UI  at http://localhost:5173
```

---

## Environment variables

### server/.env

| Variable        | Example value                          | What it does                                  |
|-----------------|----------------------------------------|-----------------------------------------------|
| `MONGODB_URI`   | `mongodb://localhost:27017/kanban`     | Where MongoDB is running                      |
| `PORT`          | `5000`                                 | Port the Express server listens on            |
| `CLIENT_ORIGIN` | `http://localhost:5173`                | Allowed CORS origin (must match the React URL)|

### client/.env

| Variable       | Example value              | What it does                            |
|----------------|----------------------------|-----------------------------------------|
| `VITE_API_URL` | `http://localhost:5000`    | Base URL the React app sends requests to|

---

## API health check

Once the server is running, open http://localhost:5000/api/health in your browser.
You should see: `{ "status": "ok", "timestamp": "..." }`.

---

## Tech stack

| Layer    | Technology              |
|----------|-------------------------|
| Database | MongoDB + Mongoose      |
| API      | Node.js + Express       |
| UI       | React + Vite            |
| Drag & Drop | @dnd-kit             |
| Toasts   | react-hot-toast         |
