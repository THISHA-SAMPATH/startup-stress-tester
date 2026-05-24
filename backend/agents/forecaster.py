import json
import re
from agents.grok_client import generate_text


def run_forecaster(memory) -> dict:
    prompt = f"""You are a neutral market forecaster and trace engine in a simulation.

Full current state:
{memory.to_context()}

Your job:
- Analyze everything that happened this round
- Calculate a Survival Confidence Score
- Identify the startup's biggest vulnerability right now
- Give one specific recommendation to survive

Respond ONLY in raw JSON with no markdown, no backticks, no explanation:
{{
  "survival_score": 72,
  "score_reasoning": "why this score in 1-2 sentences",
  "biggest_vulnerability": "specific weakness",
  "recommendation": "one concrete action to survive",
  "runway_estimate": "how many more rounds before collapse"
}}

survival_score must be a plain integer between 0 and 100.
"""
    raw = generate_text(prompt)
    data = _parse_json(raw, "forecaster")

    memory.survival_score = int(data.get("survival_score", memory.survival_score))
    memory.forecaster_verdict = data.get("recommendation", "")
    memory.log("Forecaster", f"Survival: {memory.survival_score}/100 — {data.get('score_reasoning', '')}")

    return data


def _parse_json(raw: str, agent: str) -> dict:
    cleaned = re.sub(r"```(?:json)?", "", raw).strip()
    match = re.search(r'\{.*\}', cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"[{agent}] Failed to parse JSON response: {e}\nRaw: {raw[:300]}")
