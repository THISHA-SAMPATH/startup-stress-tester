# Database logging — plugs into PostgreSQL when ready
# For now, simulations are stored in memory and returned via API
# To enable: pip install psycopg2-binary and set DATABASE_URL in .env

import json
import os

DATABASE_URL = os.getenv("DATABASE_URL")

def save_simulation(result: dict) -> str:
    """Save simulation result. Returns simulation ID."""
    # Placeholder — implement with psycopg2 when DATABASE_URL is set
    import uuid
    sim_id = str(uuid.uuid4())[:8]
    print(f"  [db] Simulation {sim_id} saved (in-memory)")
    return sim_id
