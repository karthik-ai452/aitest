# CmdRunner — Backend Configuration Guide

This document outlines everything needed on the backend to make the CmdRunner QA Dashboard fully functional. Each section maps to a page/feature in the frontend.

---

## Table of Contents

1. [Tech Stack Recommendations](#1-tech-stack-recommendations)
2. [Database Schema](#2-database-schema)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [API Endpoints](#4-api-endpoints)
5. [File Upload Configuration](#5-file-upload-configuration)
6. [Real-Time / WebSocket](#6-real-time--websocket)
7. [Environment Variables](#7-environment-variables)
8. [Third-Party Integrations](#8-third-party-integrations)
9. [Infrastructure](#9-infrastructure)
10. [Page-by-Page Requirements](#10-page-by-page-requirements)

---

## 1. Tech Stack Recommendations

| Component | Options |
|---|---|
| **Backend Framework** | Node.js (Express/Fastify), Python (FastAPI/Django), PHP (Laravel) |
| **Database** | MySQL, PostgreSQL, or MongoDB |
| **Real-time** | Socket.io, WebSocket, or Server-Sent Events |
| **File Storage** | Local disk, AWS S3, or Cloudinary |
| **Queue / Background Jobs** | Redis + BullMQ, Celery, or Laravel Horizon |

---

## 2. Database Schema

### Users Table
```
users
├── id              (PK, auto-increment)
├── name            (string, not null)
├── email           (string, unique, not null)
├── password_hash   (string, not null)
├── avatar_url      (string, nullable)
├── role            (enum: 'admin', 'tester', 'viewer')
├── created_at      (timestamp)
└── updated_at      (timestamp)
```

### Test Suites Table
```
test_suites
├── id              (PK, auto-increment)
├── name            (string, not null)
├── description     (text, nullable)
├── icon            (string, nullable)          -- Material Symbols icon name
├── status          (enum: 'stable','degraded','failing','pending')
├── test_count      (integer, default: 0)
├── created_by      (FK → users.id)
├── created_at      (timestamp)
└── updated_at      (timestamp)
```

### Test Cases Table
```
test_cases
├── id              (PK, auto-increment)
├── suite_id        (FK → test_suites.id, cascade delete)
├── title           (string, not null)
├── description     (text, nullable)
├── steps           (json, nullable)             -- Array of test steps
├── expected_result (text, nullable)
├── priority        (enum: 'critical','high','medium','low')
├── status          (enum: 'active','skipped','deprecated')
├── order           (integer, default: 0)
├── created_at      (timestamp)
└── updated_at      (timestamp)
```

### Test Runs Table
```
test_runs
├── id              (PK, auto-increment)
├── run_code        (string, unique)             -- e.g. "TR-8821"
├── suite_id        (FK → test_suites.id)
├── status          (enum: 'passed','failed','warning','running','queued')
├── environment     (string, nullable)           -- e.g. "Staging-East-1"
├── duration_secs   (integer, nullable)
├── started_at      (timestamp, nullable)
├── finished_at     (timestamp, nullable)
├── triggered_by    (FK → users.id)
├── logs_url        (string, nullable)           -- Link to detailed logs
├── metadata        (json, nullable)             -- Extra run metadata
├── created_at      (timestamp)
└── updated_at      (timestamp)
```

### Test Run Results Table
```
test_run_results
├── id              (PK, auto-increment)
├── run_id          (FK → test_runs.id, cascade delete)
├── case_id         (FK → test_cases.id)
├── status          (enum: 'passed','failed','skipped','error')
├── error_message   (text, nullable)
├── screenshot_url  (string, nullable)
├── duration_ms     (integer, nullable)
├── logs            (text, nullable)
└── created_at      (timestamp)
```

### Agents Table
```
agents
├── id              (PK, auto-increment)
├── name            (string, unique)             -- e.g. "Linux-Node-01"
├── os              (string, nullable)           -- e.g. "Ubuntu 22.04"
├── status          (enum: 'online','offline','busy','warning')
├── last_heartbeat  (timestamp, nullable)
├── ip_address      (string, nullable)
├── max_concurrent  (integer, default: 5)
├── metadata        (json, nullable)
├── created_at      (timestamp)
└── updated_at      (timestamp)
```

### Agent Activity Log Table
```
agent_activity
├── id              (PK, auto-increment)
├── agent_id        (FK → agents.id)
├── action          (string, not null)           -- e.g. "Initialization of Suite [E2E-SMOKE]"
├── status          (enum: 'success','warning','error','info')
├── metadata        (json, nullable)
├── created_at      (timestamp)
```

### API Keys Table
```
api_keys
├── id              (PK, auto-increment)
├── user_id         (FK → users.id)
├── name            (string, not null)           -- e.g. "test-key-for-teammate"
├── key_hash        (string, not null)           -- Hashed version of the key
├── key_prefix      (string, not null)           -- First 8 chars for display: "sk_test_..."
├── permissions     (json, nullable)             -- Scopes: ["read", "execute"]
├── last_used_at    (timestamp, nullable)
├── expires_at      (timestamp, nullable)
├── is_active       (boolean, default: true)
└── created_at      (timestamp)
```

---

## 3. Authentication & Authorization

### What to implement:
- **Session-based auth** (cookies) or **JWT** (token-based)
- **OAuth 2.0** support (Google, GitHub) — the frontend shows a Google avatar
- **Role-based access control (RBAC):**
  - `admin` — full access, manage users, delete anything
  - `tester` — create/edit suites, trigger runs, view everything
  - `viewer` — read-only access to dashboards and reports

### Auth endpoints needed:
```
POST   /api/auth/register      — Create account
POST   /api/auth/login         — Login (email + password)
POST   /api/auth/logout        — Logout
POST   /api/auth/oauth/google  — OAuth via Google
GET    /api/auth/me            — Get current user profile
```

### Password requirements:
- Minimum 8 characters
- Bcrypt or Argon2 hashing
- Rate limiting on login (max 5 attempts per 15 min)

---

## 4. API Endpoints

### Dashboard
```
GET    /api/dashboard/stats
       → { total_suites, total_runs, pass_rate, active_agents, recent_runs[] }
```

### Test Suites
```
GET    /api/suites                     — List all suites (with filters & pagination)
GET    /api/suites/:id                 — Get single suite with test cases
POST   /api/suites                     — Create suite
PUT    /api/suites/:id                 — Update suite
DELETE /api/suites/:id                 — Delete suite

GET    /api/suites/:id/cases           — List test cases in a suite
POST   /api/suites/:id/cases           — Add test case
PUT    /api/suites/:id/cases/:caseId   — Update test case
DELETE /api/suites/:id/cases/:caseId   — Delete test case
```

### Test Runs
```
GET    /api/runs                       — List runs (filters: status, suite_id, env, date range)
GET    /api/runs/:id                   — Get run details with results
POST   /api/runs                       — Trigger a new run (body: suite_id, environment)
POST   /api/runs/:id/stop             — Stop a running test
GET    /api/runs/:id/logs             — Stream logs for a run
GET    /api/runs/:id/export           — Export run results (CSV/PDF)
```

### Agents
```
GET    /api/agents                     — List all agents with status
GET    /api/agents/:id                 — Get agent details
POST   /api/agents/:id/start          — Start an agent
POST   /api/agents/:id/stop           — Stop an agent
GET    /api/agents/activity            — Activity log (paginated)
GET    /api/agents/health              — System health summary
```

### File Upload (Test Case Files)
```
POST   /api/upload/test-cases          — Upload .xls, .pdf, or .txt
       → Accepts multipart/form-data
       → Returns parsed test cases array
```

### API Keys
```
GET    /api/keys                       — List user's API keys
POST   /api/keys                       — Generate new key (body: name, permissions)
DELETE /api/keys/:id                   — Revoke a key
```

### Browser Preview (Agent Page)
```
GET    /api/agents/:id/screenshot      — Get latest screenshot from agent
WS     /ws/agent/:id/browser           — WebSocket stream of browser session
```

---

## 5. File Upload Configuration

The Agents page accepts test case files. Configure:

| Setting | Value |
|---|---|
| **Max file size** | 10 MB |
| **Accepted formats** | `.xls`, `.xlsx`, `.pdf`, `.txt` |
| **Storage path** | `/uploads/test-cases/{suite_id}/` |
| **Parsing** | Extract test cases from uploaded file and return as JSON |

### File parsing logic needed:
- **.xls / .xlsx** — Parse rows into test case objects (columns: title, steps, expected_result)
- **.pdf** — Extract text, split into test case sections
- **.txt** — Parse line-by-line or delimiter-separated (e.g. `---` between cases)

---

## 6. Real-Time / WebSocket

The following features need live updates:

### Test Run Progress
```
WS     /ws/runs/:id
       → Emits: { event: "progress", case_id, status, duration_ms }
       → Emits: { event: "completed", status, duration_secs }
```

### Agent Status
```
WS     /ws/agents
       → Emits: { event: "heartbeat", agent_id, status, cpu, ram }
       → Emits: { event: "activity", agent_id, action, status }
```

### Browser Preview Stream
```
WS     /ws/agent/:id/browser
       → Receives: { action: "navigate", url }
       → Emits: { event: "screenshot", base64_image }
       → Emits: { event: "console", level, message }
```

### Dashboard Stats
```
WS     /ws/dashboard
       → Emits: { event: "stats_update", total_runs, pass_rate }
```

---

## 7. Environment Variables

Create a `.env` file with:

```env
# Application
APP_NAME=CmdRunner
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:3000
APP_PORT=3000

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=cmdrunner
DB_USER=cmdrunner_user
DB_PASSWORD=<secure-password>

# Authentication
JWT_SECRET=<random-64-char-string>
JWT_EXPIRY=24h
SESSION_SECRET=<random-32-char-string>

# OAuth (Google)
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GOOGLE_REDIRECT_URL=http://localhost:3000/api/auth/oauth/google/callback

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Redis (for queues & real-time)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Agent Configuration
AGENT_HEARTBEAT_INTERVAL=30000
AGENT_TIMEOUT=120000
MAX_CONCURRENT_RUNS=5

# Browser Automation (for agents)
SELENIUM_URL=http://localhost:4444/wd/hub
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

---

## 8. Third-Party Integrations

| Integration | Purpose | Config Needed |
|---|---|---|
| **Google OAuth** | Login with Google | Client ID + Secret from [Google Cloud Console](https://console.cloud.google.com/) |
| **ngrok** | Expose local API for external testing | Auth token from [ngrok.com](https://ngrok.com) |
| **Selenium / Playwright** | Browser automation for test agents | Selenium Grid URL or Playwright install |
| **Email (SMTP)** | Password reset, run notifications | SMTP host, port, user, password |
| **Slack / Discord Webhooks** | Alert on failed runs | Webhook URL per channel |

---

## 9. Infrastructure

### Services to run:

```
┌─────────────────────────────────────────────┐
│              Reverse Proxy (Caddy)           │
│                  Port 80/443                 │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐   ┌─────────────────┐
│  Static Files │   │  API Server     │
│  (HTML/JS)    │   │  Port 3001      │
└───────────────┘   └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌──────────┐  ┌────────────┐  ┌──────────┐
       │  MySQL   │  │   Redis    │  │ Selenium │
       │  :3306   │  │   :6379    │  │  :4444   │
       └──────────┘  └────────────┘  └──────────┘
```

### Background Workers:
- **Run Executor** — Picks up queued test runs and executes them on agents
- **Heartbeat Monitor** — Checks agent health every 30s, marks offline if no response
- **Notification Worker** — Sends email/Slack alerts on run completion or failure
- **Log Rotator** — Cleans up old logs and screenshots after configurable retention

---

## 10. Page-by-Page Requirements

### Dashboard (`index.html`)
| Feature | Backend Needed |
|---|---|
| Welcome message | `GET /api/auth/me` for user name |
| Quick stats | `GET /api/dashboard/stats` |
| "Create Suite" link | No backend (navigates to suites page) |
| "View Runs" link | No backend (navigates to runs page) |

### Test Suites (`suites.html`)
| Feature | Backend Needed |
|---|---|
| Suite card grid | `GET /api/suites` (returns suites with status, test_count) |
| "Create New" button | `POST /api/suites` (modal form) |
| Empty state | No backend (shown when API returns empty array) |
| "Run" button on cards | `POST /api/runs` (triggers run for that suite) |

### Test Runs (`runs.html`)
| Feature | Backend Needed |
|---|---|
| Data table | `GET /api/runs` (paginated, sorted by time desc) |
| Status badges | Status field from run records |
| Filter button | Query params: `?status=failed&env=staging` |
| Export button | `GET /api/runs/export?format=csv` |
| Pagination | `?page=1&limit=20` with total count |
| Search bar | Full-text search on suite_name, run_code |

### Agents (`agents.html`)
| Feature | Backend Needed |
|---|---|
| Actions bar (Upload, Run, Stop) | `POST /api/upload/test-cases`, `POST /api/runs`, `POST /api/runs/:id/stop` |
| Test Case Execution pane | File upload → parse → display test cases |
| Browser Preview pane | `WS /ws/agent/:id/browser` for live screenshots |
| Collapsed sidebar toggle | No backend (client-side only) |

### Documentation (`docs.html`)
| Feature | Backend Needed |
|---|---|
| Doc list | No backend (static content) |
| ngrok guide | No backend (static content) |
| ngrok download link | External link to ngrok.com |

### Sidebar (all pages)
| Feature | Backend Needed |
|---|---|
| Navigation links | No backend (static HTML) |
| Collapsed state | No backend (localStorage) |

---

## Quick Start Checklist

- [ ] Set up database and run migrations (create all tables above)
- [ ] Implement auth (register, login, OAuth)
- [ ] Build CRUD endpoints for test suites and test cases
- [ ] Build test run trigger and results endpoints
- [ ] Set up file upload endpoint for .xls/.pdf/.txt
- [ ] Implement WebSocket for real-time run updates
- [ ] Set up Redis for queue management
- [ ] Configure Selenium/Playwright for browser automation
- [ ] Set up background workers (run executor, heartbeat monitor)
- [ ] Configure email/Slack notifications
- [ ] Add CORS and rate limiting middleware
- [ ] Set up logging and monitoring
- [ ] Configure ngrok for external testing
- [ ] Write seed data for initial suites and runs
- [ ] Deploy to production with SSL