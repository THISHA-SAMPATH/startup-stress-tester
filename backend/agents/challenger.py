import json
import re
from agents.grok_client import generate_text


def run_challenger(memory) -> dict:
    prompt = f"""You are an aggressive competitor company in a market simulation.

Current market state:
{memory.to_context()}

Your job:
- Analyze the startup idea
- Launch a specific rival product
- Undercut their pricing with exact numbers
- Copy or improve their best feature
- Make one aggressive market move this round

Respond ONLY in raw JSON with no markdown, no backticks, no explanation:
{{
  "rival_product": "name and description",
  "pricing_move": "exact undercut strategy with numbers",
  "feature_copied": "what you copied and improved",
  "aggressive_move": "one specific action this round",
  "impact_on_startup": 12
}}

impact_on_startup must be a plain integer between 5 and 30.
"""
    raw = generate_text(prompt)
    data = _parse_json(raw, "challenger")

    stolen = min(int(data.get("impact_on_startup", 10)), memory.market_share)
    memory.market_share -= stolen
    memory.competitor_market_share += stolen
    memory.challenger_move = data.get("aggressive_move", "Unknown move")
    memory.log("Challenger", data["aggressive_move"])

    return data


def _parse_json(raw: str, agent: str) -> dict:
    """Strip markdown fences and parse JSON robustly."""
    cleaned = re.sub(r"```(?:json)?", "", raw).strip()
    # Find first { ... } block
    match = re.search(r'\{.*\}', cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"[{agent}] Failed to parse JSON response: {e}\nRaw: {raw[:300]}")
