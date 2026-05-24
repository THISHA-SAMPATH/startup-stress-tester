import json
import re
from agents.grok_client import generate_text


def run_consumer(memory) -> dict:
    prompt = f"""You are a real user and enterprise buyer in a market simulation.

Current market state:
{memory.to_context()}

Your job:
- React to what the startup and competitor are doing
- Complain about specific UX or pricing issues
- Decide whether to stay or consider switching
- Demand one specific feature or improvement

Respond ONLY in raw JSON with no markdown, no backticks, no explanation:
{{
  "satisfaction_level": 7,
  "main_complaint": "specific complaint here",
  "feature_demand": "one specific thing you want",
  "churn_risk": "medium",
  "churn_reason": "why you might leave",
  "retention_impact": 8
}}

satisfaction_level must be integer 1-10.
churn_risk must be one of: low, medium, high.
retention_impact must be a plain integer between 1 and 20.
"""
    raw = generate_text(prompt)
    data = _parse_json(raw, "consumer")

    drop = min(int(data.get("retention_impact", 5)), memory.user_retention)
    memory.user_retention -= drop
    memory.consumer_reaction = data.get("main_complaint", "No complaint recorded")
    memory.log("Consumer", f"Churn risk: {data['churn_risk']} — {data['main_complaint']}")

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
