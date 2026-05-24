const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface SimulationRequest {
  startup_name: string;
  startup_idea: string;
  rounds?: number;
}

export interface RoundResult {
  round: number;
  challenger: {
    rival_product: string;
    pricing_move: string;
    feature_copied: string;
    aggressive_move: string;
    impact_on_startup: number;
  };
  consumer: {
    satisfaction_level: number;
    main_complaint: string;
    feature_demand: string;
    churn_risk: string;
    churn_reason: string;
    retention_impact: number;
  };
  forecaster: {
    survival_score: number;
    score_reasoning: string;
    biggest_vulnerability: string;
    recommendation: string;
    runway_estimate: string;
  };
  memory_snapshot: {
    survival_score: number;
    market_share: number;
    user_retention: number;
    competitor_market_share: number;
  };
}

export interface SimulationResult {
  startup_name: string;
  startup_idea: string;
  rounds_completed: number;
  final_survival_score: number;
  final_market_share: number;
  final_retention: number;
  trace_log: Array<{
    round: number;
    agent: string;
    action: string;
    timestamp: number;
    survival_score: number;
  }>;
  round_results: RoundResult[];
}

export async function runSimulation(req: SimulationRequest): Promise<SimulationResult> {
  const resp = await fetch(`${API_URL}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!resp.ok) {
    let msg = `Server error (${resp.status})`;
    try {
      const err = await resp.json();
      msg = err.detail || msg;
    } catch {}
    throw new Error(msg);
  }

  return resp.json();
}
