# Expense Tracker - MERN + TypeScript

A full-stack expense and budget-cycle tracker built with:

- Vite + React + TypeScript
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Bootstrap + Bootstrap Icons
- Custom CSS
- JWT authentication

## Features

- Dashboard with daily/monthly/current-cycle summaries
- Cash In creates a new budget cycle and closes the previous one
- Dynamic allocation configuration: Percentage, Fixed, Remaining
- Custom categories, delete and reorder
- Expense creation/deletion with validation
- Historical budget cycles with preserved allocation snapshots and expenses
- Dark/light theme persisted in localStorage
- Desktop sidebar and mobile bottom navigation
- Protected routes and API authentication

## Run

### 1. Server

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

For Linux/macOS use `cp .env.example .env` instead of `copy`.

### 2. Client

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The server normally runs on `http://localhost:5000`.

## MongoDB

Set `MONGO_URI` in `server/.env` to your local MongoDB or MongoDB Atlas connection string.
