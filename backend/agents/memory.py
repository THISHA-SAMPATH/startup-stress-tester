from dataclasses import dataclass, field
from typing import List
import json
import time


@dataclass
class SharedMemory:
    startup_idea: str = ""
    startup_name: str = ""

    startup_capital: int = 100
    market_share: int = 100
    competitor_market_share: int = 0
    user_retention: int = 100
    survival_score: int = 100

    challenger_move: str = ""
    consumer_reaction: str = ""
    forecaster_verdict: str = ""

    trace_log: List[dict] = field(default_factory=list)
    current_round: int = 0

    def log(self, agent: str, action: str):
        self.trace_log.append({
            "round": self.current_round,
            "agent": agent,
            "action": action,
            "timestamp": time.time(),
            "survival_score": self.survival_score,
        })

    def to_context(self) -> str:
        return json.dumps({
            "startup_idea": self.startup_idea,
            "startup_name": self.startup_name,
            "startup_capital": self.startup_capital,
            "market_share": self.market_share,
            "competitor_market_share": self.competitor_market_share,
            "user_retention": self.user_retention,
            "survival_score": self.survival_score,
            "last_challenger_move": self.challenger_move,
            "last_consumer_reaction": self.consumer_reaction,
            "forecaster_verdict": self.forecaster_verdict,
            "current_round": self.current_round,
        }, indent=2)
