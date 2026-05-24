# 🚀 Startup Stress Tester

Battle-test your startup idea against three adversarial AI agents powered by **xAI Grok** before you build.

---

## What it does

Three AI agents simultaneously attack your startup idea:

| Agent | Role | What it does |
|-------|------|-------------|
| **Challenger** | Aggressive Competitor | Launches a rival, undercuts pricing, copies features |
| **Consumer** | Real User | Complains about UX, demands features, threatens churn |
| **Forecaster** | Market Analyst | Scores survival 0–100 every round with full reasoning |

All three share a **global memory state** — every agent reads what the others did.

---

## Setup

### 1. Get your Grok API Key

1. Go to [console.x.ai](https://console.x.ai)
2. Sign up / log in
3. Create an API key
4. Copy it

### 2. Set your API key

Edit `backend/.env`:

```env
GROK_API_KEY=your_actual_key_here
```

---

## Running with Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

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

---

## Running without Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:3000**

---

## What to change in the code

### Switch Grok model

In `backend/agents/grok_client.py`, change line:

```python
MODEL = "grok-3-mini"
```

Options: `grok-3-mini`, `grok-3`, `grok-beta`

### Change number of simulation rounds

Default is 4. Users can choose 2–8 in the UI.

### Adjust agent behavior

Each agent's prompt is in:
- `backend/agents/challenger.py` — competitor behavior
- `backend/agents/consumer.py` — user behavior  
- `backend/agents/forecaster.py` — scoring logic

### Change API port

In `docker-compose.yml`, change `8000:8000` to `YOUR_PORT:8000`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `GROK_API_KEY not set` | Edit `backend/.env` with your key |
| `401 Unauthorized` | Your Grok API key is invalid — regenerate at console.x.ai |
| `429 Rate Limited` | You've hit your quota — wait or upgrade your plan |
| Frontend can't reach backend | Make sure both services are running; check `NEXT_PUBLIC_API_URL` |
| Docker build fails | Make sure Docker Desktop is running |

---

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11
- **AI**: xAI Grok via REST API
- **Infrastructure**: Docker + Docker Compose
