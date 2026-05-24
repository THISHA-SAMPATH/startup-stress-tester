"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { runSimulation } from "@/lib/api";

const EXAMPLES = [
  { name: "BreakoutAI", tag: "GameTech · $29/mo", idea: "An AI copilot for indie game developers — auto-generates art assets, sound effects, and level designs from a simple prompt. Subscription at $29/mo." },
  { name: "Strata", tag: "B2B SaaS · $79/seat", idea: "A B2B SaaS platform that turns Notion workspaces into branded client portals with analytics, e-signatures, and white-label domains. $79/mo per seat." },
  { name: "Rootly", tag: "FinTech · 0.5% AUM", idea: "A micro-investing app for Gen Z that rounds up purchases to invest in creator economy stocks and NFT index funds. 0.5% AUM fee." },
];

const AGENTS = [
  {
    id: "challenger",
    name: "The Challenger",
    color: "var(--red)",
    light: "var(--red-light)",
    mid: "var(--red-mid)",
    border: "var(--red-glow)",
    num: "01",
    icon: "⚔",
    role: "Competitor",
    desc: "Launches a rival product, undercuts your pricing, copies your best features, and tries to kill your startup in every round.",
  },
  {
    id: "consumer",
    name: "The Consumer",
    color: "var(--amber)",
    light: "var(--amber-light)",
    mid: "var(--amber-mid)",
    border: "var(--amber-glow)",
    num: "02",
    icon: "◎",
    role: "Real User",
    desc: "Complains about UX friction, demands cheaper pricing, compares you to the competitor, and threatens to churn each round.",
  },
  {
    id: "forecaster",
    name: "The Forecaster",
    color: "var(--green)",
    light: "var(--green-light)",
    mid: "var(--green-mid)",
    border: "var(--green-glow)",
    num: "03",
    icon: "◈",
    role: "Market Analyst",
    desc: "Watches everything. Scores your survival probability 0–100 every round with timestamped reasoning and a final verdict.",
  },
];

const LOAD_STEPS = [
  "Initializing shared memory state...",
  "Spawning Challenger agent...",
  "Booting Consumer simulation...",
  "Connecting Forecaster core...",
  "Running adversarial market cycles...",
];

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [idea, setIdea] = useState("");
  const [rounds, setRounds] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadStep, setLoadStep] = useState(0);
  const [isRateLimit, setIsRateLimit] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  function fillExample(ex: typeof EXAMPLES[0]) {
    setName(ex.name);
    setIdea(ex.idea);
    setError("");
    setIsRateLimit(false);
  }

  async function handleSubmit() {
    if (!name.trim() || !idea.trim()) {
      setError("Both startup name and idea are required to run the simulation.");
      return;
    }
    setError("");
    setIsRateLimit(false);
    setLoading(true);
    setLoadStep(0);
    const interval = setInterval(() => {
      setLoadStep((s) => Math.min(s + 1, LOAD_STEPS.length - 1));
    }, 900);
    try {
      const result = await runSimulation({ startup_name: name.trim(), startup_idea: idea.trim(), rounds });
      clearInterval(interval);
      sessionStorage.setItem("sim_result", JSON.stringify(result));
      router.push("/simulation/result");
    } catch (e: unknown) {
      clearInterval(interval);
      const msg = e instanceof Error ? e.message : "Simulation failed.";
      const isRL = msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("429");
      setIsRateLimit(isRL);
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg0)", color: "var(--text1)", position: "relative", overflow: "hidden" }}>

      {/* Background texture dots */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      {/* Large decorative blob */}
      <div style={{
        position: "fixed", top: "-15vh", right: "-10vw", width: "60vw", height: "70vh",
        background: "radial-gradient(ellipse at center, rgba(61,47,160,0.05) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 40px", borderBottom: "1px solid var(--border)",
        background: "rgba(250,250,248,0.9)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--accent)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 15, fontWeight: 800,
            color: "#fff", letterSpacing: "-0.05em",
          }}>S</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.03em", color: "var(--text1)" }}>Stress Tester</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.1em" }}>MULTI-AGENT · POWERED BY GROK</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {AGENTS.map(a => (
            <div key={a.id} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 8,
              background: a.light, border: `1px solid ${a.mid}`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, animation: "pulse-dot 2s ease-in-out infinite" }} />
              <span className="mono" style={{ fontSize: 9, color: a.color, fontWeight: 600, letterSpacing: "0.06em" }}>{a.name.split(" ")[1].toUpperCase()}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 40px 0", position: "relative", zIndex: 5 }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 99, background: "var(--accent-light)",
            border: "1px solid rgba(61,47,160,0.15)", marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
            <span className="mono" style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.12em" }}>BATTLE-TEST YOUR IDEA BEFORE YOU BUILD</span>
          </div>

          <h1 className="serif" style={{
            fontSize: "clamp(44px, 6vw, 88px)", fontWeight: 900, lineHeight: 1.0,
            letterSpacing: "-0.03em", marginBottom: 28, color: "var(--text1)",
          }}>
            Will your startup<br />
            <span style={{ color: "var(--accent)" }}>survive</span>
            <span style={{ color: "var(--text2)" }}> the market?</span>
          </h1>

          <p style={{
            fontSize: 18, color: "var(--text2)", lineHeight: 1.8,
            maxWidth: 520, margin: "0 auto",
          }}>
            Three adversarial AI agents simulate what actually happens when your idea hits the real world. No pitch deck. No validation theater. Just raw market pressure.
          </p>
        </div>

        {/* Agent cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 80 }}>
          {AGENTS.map((a, i) => (
            <div
              key={a.id}
              className="animate-in"
              style={{
                animationDelay: `${i * 0.12}s`,
                background: hoveredAgent === a.id ? a.light : "#fff",
                border: `1.5px solid ${hoveredAgent === a.id ? a.mid : "var(--border)"}`,
                borderRadius: 20, padding: "28px 24px",
                boxShadow: hoveredAgent === a.id ? "0 8px 32px rgba(0,0,0,0.09)" : "var(--shadow-sm)",
                transition: "all 0.25s cubic-bezier(0.23,1,0.32,1)",
                cursor: "default",
              }}
              onMouseEnter={() => setHoveredAgent(a.id)}
              onMouseLeave={() => setHoveredAgent(null)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: a.light, border: `1.5px solid ${a.mid}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, color: a.color,
                }}>
                  {a.icon}
                </div>
                <span className="mono" style={{
                  fontSize: 11, fontWeight: 600, color: a.color,
                  background: a.light, padding: "3px 10px", borderRadius: 99,
                  border: `1px solid ${a.mid}`,
                }}>{a.role}</span>
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.15em", marginBottom: 6 }}>AGENT {a.num}</div>
              <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.03em", marginBottom: 10, color: "var(--text1)" }}>{a.name}</div>
              <div style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.7 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Form section */}
      <section style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 40px 120px",
        display: "grid", gridTemplateColumns: "1fr 460px", gap: 48, alignItems: "start",
        position: "relative", zIndex: 5,
      }}>

        {/* Left: stats + info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <div>
            <div className="serif" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 12, color: "var(--text1)" }}>
              How it works
            </div>
            <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.8, maxWidth: 400 }}>
              Enter your startup idea and three Grok-powered AI agents run adversarial simulations across multiple rounds — each reading the shared global memory state.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { val: "3", label: "AI Agents", sub: "Challenger · Consumer · Forecaster" },
              { val: "0→100", label: "Survival Score", sub: "Recalculated every round" },
              { val: "∞", label: "Shared Memory", sub: "Every agent reads all state" },
            ].map(s => (
              <div key={s.val} style={{
                background: "#fff", border: "1px solid var(--border)", borderRadius: 16,
                padding: "20px 18px", boxShadow: "var(--shadow-sm)",
              }}>
                <div className="serif" style={{ fontSize: 28, fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.04em", marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text1)", marginBottom: 4 }}>{s.label}</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--text3)", lineHeight: 1.5 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Process steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { step: "Input", desc: "Enter your startup name, business model, and simulation depth" },
              { step: "Agents Run", desc: "Challenger, Consumer, and Forecaster attack your idea each round" },
              { step: "Verdict", desc: "Get survival score, trace log, and actionable recommendations" },
            ].map((s, i) => (
              <div key={s.step} style={{ display: "flex", gap: 16, paddingBottom: i < 2 ? 24 : 0, position: "relative" }}>
                {i < 2 && <div style={{ position: "absolute", left: 17, top: 34, width: 2, height: "calc(100% - 10px)", background: "var(--border)" }} />}
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", background: "var(--accent-light)",
                  border: "2px solid var(--accent)", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                }}>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>{i + 1}</span>
                </div>
                <div style={{ paddingTop: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text1)", marginBottom: 3 }}>{s.step}</div>
                  <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div style={{
          background: "#fff",
          border: "1.5px solid var(--border)",
          borderRadius: 24, padding: "36px 32px",
          boxShadow: "var(--shadow-xl)",
          display: "flex", flexDirection: "column", gap: 26,
          position: "sticky", top: 90,
        }}>
          {/* Form header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em", color: "var(--text1)" }}>New Simulation</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.15em", marginTop: 2 }}>POWERED BY GROK-3</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["var(--red)", "var(--amber)", "var(--green)"].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mono" style={{ display: "block", fontSize: 9, color: "var(--text3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Startup Name</label>
            <input
              value={name} onChange={e => setName(e.target.value)} disabled={loading}
              placeholder="e.g. BreakoutAI"
              style={{
                width: "100%", background: "var(--bg0)", border: "1.5px solid var(--border)",
                borderRadius: 12, padding: "13px 16px", fontSize: 14.5, color: "var(--text1)",
                outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Idea */}
          <div>
            <label className="mono" style={{ display: "block", fontSize: 9, color: "var(--text3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Business Model & Idea</label>
            <textarea
              value={idea} onChange={e => setIdea(e.target.value)} rows={5} disabled={loading}
              placeholder="Describe your product, target market, pricing model, and key differentiators..."
              style={{
                width: "100%", background: "var(--bg0)", border: "1.5px solid var(--border)",
                borderRadius: 12, padding: "13px 16px", fontSize: 13.5, color: "var(--text1)",
                outline: "none", resize: "none", lineHeight: 1.7, fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Quick examples */}
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Quick Start Examples</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {EXAMPLES.map(ex => (
                <button key={ex.name} onClick={() => fillExample(ex)} disabled={loading}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                    padding: "10px 14px", borderRadius: 10, background: "var(--bg0)",
                    border: "1.5px solid var(--border)", cursor: "pointer", transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { (e.currentTarget).style.borderColor = "var(--accent)"; (e.currentTarget).style.background = "var(--accent-light)"; }}
                  onMouseLeave={e => { (e.currentTarget).style.borderColor = "var(--border)"; (e.currentTarget).style.background = "var(--bg0)"; }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-light)", border: "1px solid rgba(61,47,160,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "var(--accent)" }}>{ex.name[0]}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text1)", marginBottom: 2 }}>{ex.name}</div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--text3)" }}>{ex.tag}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rounds */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="mono" style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Simulation Depth</span>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{rounds} {rounds === 1 ? "Round" : "Rounds"}</span>
            </div>
            <input type="range" min={2} max={8} value={rounds} onChange={e => setRounds(Number(e.target.value))} disabled={loading}
              style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }} />
            <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--text3)", marginTop: 6 }}>
              <span>Quick (2)</span><span>Deep (8)</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            isRateLimit ? (
              <div className="rate-limit-banner">
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--warn)", marginBottom: 6 }}>⏱ API Rate Limit Reached</div>
                <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6, marginBottom: 12 }}>Your Grok API quota is temporarily exhausted.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { label: "Wait a few minutes and retry", icon: "⏰" },
                    { label: "Check your xAI console quota", icon: "📊" },
                    { label: "Upgrade your API plan at console.x.ai", icon: "💳" },
                  ].map(opt => (
                    <div key={opt.label} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text2)", alignItems: "center" }}>
                      <span>{opt.icon}</span><span>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: "var(--red-light)", border: "1px solid var(--red-mid)", borderRadius: 12, padding: "14px 16px", fontSize: 12.5, color: "var(--red)", lineHeight: 1.6 }}>
                ⚠ {error}
              </div>
            )
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit} disabled={loading}
            style={{
              width: "100%",
              background: loading ? "var(--bg1)" : "var(--accent)",
              color: loading ? "var(--text3)" : "#fff",
              border: "none", borderRadius: 14, padding: "16px",
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s", letterSpacing: "-0.01em", fontFamily: "inherit",
              boxShadow: loading ? "none" : "0 4px 20px rgba(61,47,160,0.3)",
            }}
            onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(61,47,160,0.4)"; } }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = loading ? "none" : "0 4px 20px rgba(61,47,160,0.3)"; }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{ width: 14, height: 14, border: "2px solid var(--border-hover)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                <span className="mono" style={{ fontSize: 10, color: "var(--text2)" }}>{LOAD_STEPS[loadStep]}</span>
              </span>
            ) : "Run Simulation →"}
          </button>

          <div className="mono" style={{ fontSize: 9, color: "var(--text4)", textAlign: "center" }}>
            Simulation runs 3 agents × {rounds} rounds · Powered by xAI Grok
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          section { grid-template-columns: 1fr !important; padding: 0 20px 80px !important; }
          section > div:first-child > div:nth-child(2) { grid-template-columns: 1fr 1fr !important; }
          nav > div:last-child { display: none !important; }
          h1 { font-size: 40px !important; }
        }
        @media (max-width: 680px) {
          section:first-of-type > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}