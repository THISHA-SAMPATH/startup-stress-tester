from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.simulation import run_simulation

router = APIRouter()


class SimulationRequest(BaseModel):
    startup_name: str
    startup_idea: str
    rounds: int = 4


@router.post("/simulate")
def simulate(req: SimulationRequest):
    if not req.startup_name or not req.startup_idea:
        raise HTTPException(status_code=400, detail="startup_name and startup_idea are required")
    if req.rounds < 1 or req.rounds > 8:
        raise HTTPException(status_code=400, detail="rounds must be between 1 and 8")
    
    result = run_simulation(
        startup_idea=req.startup_idea,
        startup_name=req.startup_name,
        rounds=req.rounds,
    )
    return result


@router.get("/health")
def health():
    return {"status": "ok"}
