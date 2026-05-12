# QuickBite (Campus Canteen System)

A production-grade, full-stack monorepo for ordering food from a college/campus canteen. This system allows students to skip the queue by ordering ahead and picking up their food during specifically allocated time slots.

## 🏗️ Project Structure

```text
quickbite/
│
├── apps/
│   ├── web/        ← Next.js frontend
│   ├── api/        ← FastAPI backend
│   └── admin/      ← Admin Dashboard (Planned)
│
├── packages/       ← Shared configurations & types
├── infrastructure/ ← Docker, CI/CD, and deployment scripts
├── docs/           ← API documentation & architecture guides
├── scripts/        ← Automation & maintenance scripts
│
├── .env            # Root environment variables
├── package.json    # Monorepo configuration (Turbo & Workspaces)
└── README.md
```

## ✨ Key Features

*   **User Authentication**: Secure sign-up/login for students and admins.
*   **Menu Browsing**: Real-time stock availability and dynamic pricing.
*   **Time Slot Booking**: Intelligent capacity management for pickup slots.
*   **Order Management**: Real-time status updates (Preparing → Ready → Completed).
*   **Modern UI/UX**: Built with Next.js 14, Tailwind CSS, and shadcn/ui.

## 🛠️ Tech Stack

### Core
*   **Monorepo Tooling**: [Turborepo](https://turbo.build/) + NPM Workspaces
*   **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS
*   **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+), SQLAlchemy 2.0
*   **Database**: PostgreSQL (Production) / SQLite (Development)
*   **Caching**: Redis (for rate limiting and session management)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   Docker (Optional, for local services like PostgreSQL/Redis)

### 1. Installation
Install all dependencies for the entire monorepo from the root:
```bash
npm install
```

### 2. Environment Setup
Copy the example environment file and update your variables:
```bash
cp .env.example .env
```

### 3. Running Locally
Start both the frontend and backend in development mode:
```bash
npm run dev
```
*   **Web**: http://localhost:3000
*   **API**: http://localhost:8000
*   **API Docs**: http://localhost:8000/docs

## 📦 Deployment
The project is optimized for deployment on:
*   **Frontend**: Vercel
*   **Backend**: Render / Docker (AWS/GCP)

## 📝 License
MIT License
