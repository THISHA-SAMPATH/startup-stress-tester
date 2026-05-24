import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.memory import SharedMemory
from agents.challenger import run_challenger
from agents.consumer import run_consumer
from agents.forecaster import run_forecaster


def run_simulation(startup_idea: str, startup_name: str, rounds: int = 4) -> dict:
    memory = SharedMemory(
        startup_idea=startup_idea,
        startup_name=startup_name,
    )

    results = []

    for round_num in range(1, rounds + 1):
        memory.current_round = round_num
        print(f"\n--- Round {round_num} ---")

        try:
            challenger_output = run_challenger(memory)
            print(f"  Challenger: {challenger_output['aggressive_move']}")
        except Exception as e:
            print(f"  [!] Challenger failed: {e}")
            challenger_output = {
                "rival_product": "Unknown rival",
                "pricing_move": "N/A",
                "feature_copied": "N/A",
                "aggressive_move": f"Agent error: {str(e)[:80]}",
                "impact_on_startup": 0,
            }

        try:
            consumer_output = run_consumer(memory)
            print(f"  Consumer:   {consumer_output['main_complaint']}")
        except Exception as e:
            print(f"  [!] Consumer failed: {e}")
            consumer_output = {
                "satisfaction_level": 5,
                "main_complaint": f"Agent error: {str(e)[:80]}",
                "feature_demand": "N/A",
                "churn_risk": "medium",
                "churn_reason": "N/A",
                "retention_impact": 0,
            }

        try:
            forecaster_output = run_forecaster(memory)
            print(f"  Forecaster: Survival Score = {memory.survival_score}/100")
        except Exception as e:
            print(f"  [!] Forecaster failed: {e}")
            forecaster_output = {
                "survival_score": memory.survival_score,
                "score_reasoning": f"Agent error: {str(e)[:80]}",
                "biggest_vulnerability": "Unknown",
                "recommendation": "Fix agent errors and retry.",
                "runway_estimate": "Unknown",
            }

        results.append({
            "round": round_num,
            "challenger": challenger_output,
            "consumer": consumer_output,
            "forecaster": forecaster_output,
            "memory_snapshot": {
                "survival_score": memory.survival_score,
                "market_share": memory.market_share,
                "user_retention": memory.user_retention,
                "competitor_market_share": memory.competitor_market_share,
            },
        })

        if memory.survival_score < 10:
            print("\n  ⚠️  Startup has collapsed.")
            break

    return {
        "startup_name": startup_name,
        "startup_idea": startup_idea,
        "rounds_completed": memory.current_round,
        "final_survival_score": memory.survival_score,
        "final_market_share": memory.market_share,
        "final_retention": memory.user_retention,
        "trace_log": memory.trace_log,
        "round_results": results,
    }


if __name__ == "__main__":
    result = run_simulation(
        startup_idea="An agentic-AI-first company building great products with people who have specific knowledge and strong product taste",
        startup_name="BreakoutAI",
    )

    print("\n=== FINAL RESULT ===")
    print(f"Survival Score : {result['final_survival_score']}/100")
    print(f"Market Share   : {result['final_market_share']}%")
    print(f"User Retention : {result['final_retention']}%")
    print("\nTrace Log:")
    for log in result["trace_log"]:
        print(f"  Round {log['round']} | {log['agent']:12} | {log['action']}")
