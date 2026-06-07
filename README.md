# Startup Stress Tester

> Battle-test your startup idea against three adversarial AI agents before you build.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-FF6C37?style=flat&logoColor=white)](https://openrouter.ai)

---

## What it does

Three AI agents simultaneously attack your startup idea:

| Agent | Role | What it does |
|-------|------|-------------|
| **Challenger** | Aggressive Competitor | Launches a rival, undercuts pricing, copies features |
| **Consumer** | Real User | Complains about UX, demands features, threatens churn |
| **Forecaster** | Market Analyst | Scores survival 0–100 every round with full reasoning |

All three share a **global memory state** — every agent reads what the others did and responds to it.

> Demonstrates: **traceability · shared memory · confidence scoring · agent environments**

---

## Setup

### 1. Get your free OpenRouter API Key

- Go to [openrouter.ai](https://openrouter.ai)
- Sign up with Google — no card needed
- Click **API Keys → Create key → Copy it**

### 2. Set your API key

Edit `backend/.env`:
```env
OPENROUTER_API_KEY=your_key_here
```

---

## Running with Docker (Recommended)

**Prerequisites:** Docker Desktop installed and running

```bash
git clone https://github.com/THISHA-SAMPATH/startup-stress-tester
cd startup-stress-tester
docker compose up --build
```

Open: http://localhost:3000

```bash
# Stop
docker compose down
```

---

## Running without Docker

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

---

## How it works

1. You input a startup name and idea
2. The **Challenger** agent launches a rival company and attacks
3. The **Consumer** agent reacts as a real user — complains, churns, demands features
4. The **Forecaster** agent reads the full shared memory and scores survival 0–100
5. All agents update a shared global state every round
6. The dashboard shows the full trace log, memory state, and survival graph in real time

---

## Architecture

User Input
↓
Challenger  →  reads shared memory → attacks  → writes to memory
↓
Consumer    →  reads memory → reacts          → writes to memory
↓
Forecaster  →  reads full memory → scores     → logs trace
↓
Repeat for N rounds
↓
Dashboard shows full trace log, memory state, and survival graph live
---

## Adjust agent behavior

Each agent's prompt is in:

- `backend/agents/challenger.py` — competitor behavior
- `backend/agents/consumer.py` — user behavior
- `backend/agents/forecaster.py` — scoring logic

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| AI | OpenRouter API (free tier) |
| Infrastructure | Docker + Docker Compose |

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `OPENROUTER_API_KEY` not set | Edit `backend/.env` with your key |
| 401 Unauthorized | API key invalid — regenerate at openrouter.ai |
| 429 Rate Limited | Free tier limit hit — wait a few minutes |
| Frontend can't reach backend | Make sure both services are running |
| Docker build fails | Make sure Docker Desktop is running |

---

## Why I built this

Inspired by the gap in agentic AI — most tools just summarize. This one attacks, reacts, and scores. It demonstrates multi-agent collaboration with shared memory and full traceability in a way that's immediately useful to any founder.
