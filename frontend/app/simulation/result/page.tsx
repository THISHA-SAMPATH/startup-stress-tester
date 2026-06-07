"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SimulationResult } from "@/lib/api";
import TraceTimeline from "@/components/TraceTimeline";
import MemoryPanel from "@/components/MemoryPanel";
import SurvivalGraph from "@/components/SurvivalGraph";

function isAgentError(val: string | number | undefined): boolean {
  if (typeof val !== "string") return false;
  return val.includes("Agent error") || val.includes("rate limit") || val.includes("RESOURCE_EXHAUSTED") || val.includes("❌") || val.includes("quota");
}

function cleanField(val: string | number | undefined, fallback = "—"): string {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "number") return String(val);
  if (isAgentError(val)) return "⚠ API quota reached";
  return val || fallback;
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | string>("all");
  const [activeTab, setActiveTab] = useState<"rounds" | "timeline">("rounds");

useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("sim_result");
    if (!raw) { router.push("/"); return; }
    setResult(JSON.parse(raw));
}, [router]);

  const simId = useMemo(() => `ST-${Math.floor(Math.random() * 9000 + 1000)}`, []);

  if (!result) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg0)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 36, height: 36, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span className="mono" style={{ fontSize: 10, color: "#9B9A96", letterSpacing: "0.2em" }}>LOADING SIMULATION DATA...</span>
      </div>
    );
  }

  const score = result.final_survival_score;
  const scoreColor = score >= 70 ? "var(--green)" : score >= 40 ? "var(--amber)" : "var(--red)";
  const scoreBg = score >= 70 ? "var(--green-light)" : score >= 40 ? "var(--amber-light)" : "var(--red-light)";
  const scoreMid = score >= 70 ? "var(--green-mid)" : score >= 40 ? "var(--amber-mid)" : "var(--red-mid)";
  const scoreLabel = score >= 70 ? "Likely to Survive" : score >= 40 ? "At Risk" : "Critical — High Failure Risk";
  const scoreEmoji = score >= 70 ? "✓" : score >= 40 ? "⚡" : "✗";
  const traceLogs = (result as any).trace_logs ?? result.trace_log ?? [];

  const survivalScores = result.round_results.map(r => r.forecaster?.survival_score ?? r.memory_snapshot?.survival_score ?? 0);

  const currentRoundData = selectedRound === "all"
    ? result.round_results[result.round_results.length - 1]
    : result.round_results[Number(selectedRound) - 1];

  const AGENT_COLS = [
    {
      agent: "Challenger", color: "var(--red)", light: "var(--red-light)", mid: "var(--red-mid)", icon: "⚔",
      getItems: (r: typeof result.round_results[0]) => [
        ["Rival Product", cleanField(r.challenger.rival_product)],
        ["Pricing Move", cleanField(r.challenger.pricing_move)],
        ["Feature Copied", cleanField(r.challenger.feature_copied)],
        ["Aggressive Move", cleanField(r.challenger.aggressive_move)],
      ]
    },
    {
      agent: "Consumer", color: "var(--amber)", light: "var(--amber-light)", mid: "var(--amber-mid)", icon: "◎",
      getItems: (r: typeof result.round_results[0]) => [
        ["Satisfaction", `${r.consumer.satisfaction_level}/10`],
        ["Main Complaint", cleanField(r.consumer.main_complaint)],
        ["Feature Demand", cleanField(r.consumer.feature_demand)],
        ["Churn Risk", cleanField(r.consumer.churn_risk)],
      ]
    },
    {
      agent: "Forecaster", color: "var(--green)", light: "var(--green-light)", mid: "var(--green-mid)", icon: "◈",
      getItems: (r: typeof result.round_results[0]) => [
        ["Verdict", cleanField(r.forecaster.score_reasoning)],
        ["Vulnerability", cleanField(r.forecaster.biggest_vulnerability)],
        ["Recommendation", cleanField(r.forecaster.recommendation)],
        ["Runway", cleanField(r.forecaster.runway_estimate)],
      ]
    },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg0)", color: "var(--text1)" }}>

      {/* Dot grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      {/* Sticky header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 32px", borderBottom: "1px solid var(--border)",
        background: "rgba(250,250,248,0.92)", backdropFilter: "blur(16px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => router.push("/")} style={{
            width: 32, height: 32, borderRadius: 9, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#fff", border: "none", cursor: "pointer",
          }}>S</button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.03em" }}>{result.startup_name}</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.08em" }}>{simId} · {result.rounds_completed} ROUNDS</div>
          </div>
          {/* Score badge */}
          <div style={{
            padding: "6px 16px", borderRadius: 10,
            background: scoreBg, border: `1.5px solid ${scoreMid}`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: scoreColor }}>{score}</span>
            <span style={{ fontSize: 11, color: scoreColor }}>{scoreLabel}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Market Share", val: `${result.final_market_share}%`, color: "var(--accent)" },
              { label: "User Retention", val: `${result.final_retention}%`, color: "var(--green)" },
            ].map(m => (
              <div key={m.label} style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.val}</div>
                <div className="mono" style={{ fontSize: 8, color: "var(--text3)", letterSpacing: "0.1em" }}>{m.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <button onClick={() => router.push("/")} style={{
            padding: "8px 18px", borderRadius: 10, background: "#fff",
            border: "1.5px solid var(--border)", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", color: "var(--text1)",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text1)"; }}
          >← New Simulation</button>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 80px", position: "relative", zIndex: 5 }}>

        {/* Hero verdict */}
        <div style={{
          background: "#fff", border: "1.5px solid var(--border)", borderRadius: 24,
          padding: "40px 48px", marginBottom: 32, boxShadow: "var(--shadow-md)",
          display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center",
        }}>
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 16, height: 1, background: "var(--text4)", display: "inline-block" }} />
              Final Simulation Verdict
            </div>
            <h1 className="serif" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.05 }}>
              <span style={{ color: scoreColor }}>{scoreEmoji} </span>
              {result.startup_name} is{" "}
              <span style={{ color: scoreColor }}>{score >= 70 ? "battle-ready" : score >= 40 ? "under pressure" : "in critical danger"}</span>
            </h1>
            <p style={{ fontSize: 15.5, color: "var(--text2)", lineHeight: 1.8, maxWidth: 600 }}>
              After {result.rounds_completed} adversarial rounds, the simulation has scored {result.startup_name} at{" "}
              <strong style={{ color: scoreColor }}>{score}/100</strong> survival confidence.
              {" "}{score >= 70
                ? "Your startup shows strong market resilience. Key threats have been identified and manageable."
                : score >= 40
                  ? "Significant market forces are threatening survival. Immediate strategic pivots are recommended."
                  : "The simulation predicts high probability of failure without major changes to your model."}
            </p>
          </div>
          <div style={{
            width: 120, height: 120, borderRadius: "50%",
            background: scoreBg, border: `3px solid ${scoreMid}`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            flexDirection: "column",
          }}>
            <div className="serif" style={{ fontSize: 36, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</div>
            <div className="mono" style={{ fontSize: 8, color: scoreColor, letterSpacing: "0.1em" }}>/100</div>
          </div>
        </div>

        {/* Survival graph */}
        <div style={{
          background: "#fff", border: "1px solid var(--border)", borderRadius: 20,
          padding: "28px 32px", marginBottom: 32, boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.03em", marginBottom: 4 }}>Survival Score Trajectory</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.12em" }}>FORECASTER OUTPUT PER ROUND</div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[["Start", "100"], ["End", String(score)]].map(([l, v]) => (
                <div key={l} style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--text1)" }}>{v}</div>
                  <div className="mono" style={{ fontSize: 8, color: "var(--text3)", letterSpacing: "0.1em" }}>{l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 220 }}>
            <SurvivalGraph scores={[100, ...survivalScores]} />
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Survival Score", val: `${score}/100`, color: scoreColor, bg: scoreBg, sub: "Final forecaster rating" },
            { label: "Market Share", val: `${result.final_market_share}%`, color: "var(--accent)", bg: "var(--accent-light)", sub: `Lost ${100 - result.final_market_share}% to competitor` },
            { label: "User Retention", val: `${result.final_retention}%`, color: "var(--green)", bg: "var(--green-light)", sub: `${100 - result.final_retention}% churn risk` },
            { label: "Rounds Run", val: `${result.rounds_completed}`, color: "var(--text1)", bg: "var(--bg1)", sub: `${traceLogs.length} total agent decisions` },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: "1px solid var(--border)", borderRadius: 16,
              padding: "20px 20px",
            }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
              <div className="serif" style={{ fontSize: 32, fontWeight: 900, color: s.color, letterSpacing: "-0.04em", marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "var(--text2)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 24,
          borderBottom: "1px solid var(--border)", paddingBottom: 0,
        }}>
          {(["rounds", "timeline"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "10px 20px", borderRadius: "10px 10px 0 0", border: "none",
              background: activeTab === tab ? "#fff" : "transparent",
              borderTop: activeTab === tab ? "1.5px solid var(--border)" : "none",
              borderLeft: activeTab === tab ? "1.5px solid var(--border)" : "none",
              borderRight: activeTab === tab ? "1.5px solid var(--border)" : "none",
              borderBottom: activeTab === tab ? "2px solid #fff" : "none",
              marginBottom: activeTab === tab ? -1 : 0,
              fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? "var(--text1)" : "var(--text3)",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              textTransform: "capitalize", letterSpacing: "-0.01em",
            }}>
              {tab === "rounds" ? "Round-by-Round" : "Trace Timeline"}
            </button>
          ))}
        </div>

        {/* Round filter */}
        {activeTab === "rounds" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {(["all", ...result.round_results.map((_, i) => i + 1)] as (string | number)[]).map(r => (
              <button key={r} onClick={() => setSelectedRound(r)} style={{
                padding: "6px 16px", borderRadius: 99, border: "1.5px solid",
                borderColor: selectedRound === r ? "var(--accent)" : "var(--border)",
                background: selectedRound === r ? "var(--accent-light)" : "#fff",
                color: selectedRound === r ? "var(--accent)" : "var(--text2)",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}>
                {r === "all" ? "All Rounds" : `Round ${r}`}
              </button>
            ))}
          </div>
        )}

        {activeTab === "rounds" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>

            {/* Agent columns */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(selectedRound === "all" ? result.round_results : [result.round_results[Number(selectedRound) - 1]]).map((r, ri) => (
                <div key={ri} style={{
                  background: "#fff", border: "1.5px solid var(--border)", borderRadius: 20,
                  padding: "28px 28px", boxShadow: "var(--shadow-sm)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div>
                      <div className="mono" style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.15em", marginBottom: 4 }}>SIMULATION ROUND</div>
                      <div className="serif" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>Round {r.round}</div>
                    </div>
                    <div style={{
                      padding: "8px 16px", borderRadius: 10,
                      background: r.memory_snapshot.survival_score >= 70 ? "var(--green-light)" : r.memory_snapshot.survival_score >= 40 ? "var(--amber-light)" : "var(--red-light)",
                      border: `1px solid ${r.memory_snapshot.survival_score >= 70 ? "var(--green-mid)" : r.memory_snapshot.survival_score >= 40 ? "var(--amber-mid)" : "var(--red-mid)"}`,
                    }}>
                      <span className="mono" style={{
                        fontSize: 16, fontWeight: 700,
                        color: r.memory_snapshot.survival_score >= 70 ? "var(--green)" : r.memory_snapshot.survival_score >= 40 ? "var(--amber)" : "var(--red)",
                      }}>↯ {r.memory_snapshot.survival_score}</span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {AGENT_COLS.map(col => (
                      <div key={col.agent} style={{
                        background: col.light, border: `1px solid ${col.mid}`,
                        borderRadius: 14, padding: "16px",
                      }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 14 }}>
                          <span style={{ fontSize: 14, color: col.color }}>{col.icon}</span>
                          <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: col.color, letterSpacing: "0.08em" }}>{col.agent.toUpperCase()}</span>
                        </div>
                        {col.getItems(r).map(([k, v]) => (
                          <div key={k} style={{ marginBottom: 12 }}>
                            <div className="mono" style={{ fontSize: 8, color: "var(--text3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
                            <div style={{ fontSize: 12.5, color: "var(--text1)", lineHeight: 1.6, fontWeight: k === "Satisfaction" || k === "Churn Risk" ? 700 : 400 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Memory panel */}
            <div style={{ position: "sticky", top: 90 }}>
              {currentRoundData && (
                <MemoryPanel
                  snapshot={currentRoundData.memory_snapshot}
                  round={currentRoundData.round}
                  challengerMove={cleanField(currentRoundData.challenger.aggressive_move)}
                  consumerReaction={cleanField(currentRoundData.consumer.main_complaint)}
                  forecasterVerdict={cleanField(currentRoundData.forecaster.recommendation)}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: "28px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.03em", marginBottom: 4 }}>Agent Decision Log</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.12em" }}>{traceLogs.length} TOTAL ENTRIES · ALL ROUNDS</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Challenger", "Consumer", "Forecaster"].map((a, i) => {
                  const colors = ["var(--red)", "var(--amber)", "var(--green)"];
                  const bgs = ["var(--red-light)", "var(--amber-light)", "var(--green-light)"];
                  const borders = ["var(--red-mid)", "var(--amber-mid)", "var(--green-mid)"];
                  return (
                    <span key={a} style={{
                      fontSize: 10, fontWeight: 600, color: colors[i],
                      background: bgs[i], padding: "3px 10px", borderRadius: 99,
                      border: `1px solid ${borders[i]}`, fontFamily: "DM Mono, monospace",
                    }}>{a}</span>
                  );
                })}
              </div>
            </div>
            <TraceTimeline logs={traceLogs} filter="all" />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1100px) {
          div[style*="gridTemplateColumns: 2fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="gridTemplateColumns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 680px) {
          header { padding: 12px 16px !important; }
          div[style*="padding: 40px 32px"] { padding: 24px 16px 60px !important; }
        }
      `}</style>
    </main>
  );
}
