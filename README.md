# 🚀 Startup Stress Tester

Battle-test your startup idea against three adversarial AI agents before you build.

## What it does

Three AI agents simultaneously attack your startup idea:

| Agent | Role | What it does |
|---|---|---|
| Challenger | Aggressive Competitor | Launches a rival, undercuts pricing, copies features |
| Consumer | Real User | Complains about UX, demands features, threatens churn |
| Forecaster | Market Analyst | Scores survival 0–100 every round with full reasoning |

All three share a **global memory state** — every agent reads what the others did and responds to it.

This demonstrates: **traceability · shared memory · confidence scoring · agent environments**

## Setup

### 1. Get your free OpenRouter API Key
- Go to **openrouter.ai**
- Sign up with Google — no card needed
- Click API Keys → Create key → Copy it

### 2. Set your API key

Edit `backend/.env`:

```env
OPENROUTER_API_KEY=your_key_here
```

## Running with Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running

### Start everything

```bash
cd startup-stress-tester
docker compose up --build
```

Then open: **http://localhost:3000**

### Stop

```bash
docker compose down
```

## Running without Docker

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:3000**

## How it works

1. You input a startup name and idea
2. The **Challenger** agent launches a rival company and attacks
3. The **Consumer** agent reacts as a real user — complains, churns, demands features
4. The **Forecaster** agent reads the full shared memory and scores survival 0–100
5. All agents update a shared global state every round
6. The dashboard shows the full trace log, memory state, and survival graph in real time

## Architecture
User Input
↓
Challenger reads shared memory → attacks → writes to memory
↓
Consumer reads memory → reacts → writes to memory
↓
Forecaster reads full memory → scores → logs trace
↓
Repeat for N rounds
↓
Dashboard shows everything live

## Adjust agent behavior

Each agent's prompt is in:
- `backend/agents/challenger.py` — competitor behavior
- `backend/agents/consumer.py` — user behavior
- `backend/agents/forecaster.py` — scoring logic

## Troubleshooting

| Problem | Solution |
|---|---|
| `OPENROUTER_API_KEY not set` | Edit `backend/.env` with your key |
| `401 Unauthorized` | Your OpenRouter API key is invalid — regenerate at openrouter.ai |
| `429 Rate Limited` | Free tier limit hit — wait a few minutes and retry |
| Frontend can't reach backend | Make sure both services are running |
| Docker build fails | Make sure Docker Desktop is running |

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python 3.11
- **AI:** OpenRouter API (free tier) — `openrouter/free` model router
- **Infrastructure:** Docker + Docker Compose

## Why I built this

Inspired by the gap in agentic AI — most tools just summarize. This one attacks, reacts, and scores. It demonstrates multi-agent collaboration with shared memory and full traceability in a way that's immediately useful to any founder.