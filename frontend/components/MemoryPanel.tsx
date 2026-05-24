"use client";

interface MemorySnapshot {
  survival_score: number;
  market_share: number;
  user_retention: number;
  competitor_market_share: number;
}

interface Props {
  snapshot: MemorySnapshot;
  round: number;
  challengerMove?: string;
  consumerReaction?: string;
  forecasterVerdict?: string;
}

function Bar({ value, color, bg }: { value: number; color: string; bg: string }) {
  return (
    <div style={{ height: 6, borderRadius: 99, background: bg, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 99, width: `${Math.max(0, Math.min(100, value))}%`,
        background: color, transition: "width 0.8s cubic-bezier(0.23,1,0.32,1)",
      }} />
    </div>
  );
}

export default function MemoryPanel({ snapshot, round, challengerMove, consumerReaction, forecasterVerdict }: Props) {
  const { survival_score, market_share, user_retention, competitor_market_share } = snapshot;

  const scoreColor = survival_score >= 70 ? "#1A7A4A" : survival_score >= 40 ? "#C2680A" : "#D92B3A";
  const scoreBg = survival_score >= 70 ? "#EDFBF3" : survival_score >= 40 ? "#FFF8EE" : "#FFF0F1";

  const metrics = [
    { label: "Market Share", value: market_share, color: "#3D2FA0", bg: "rgba(61,47,160,0.1)" },
    { label: "User Retention", value: user_retention, color: "#1A7A4A", bg: "rgba(26,122,74,0.1)" },
    { label: "Competitor Share", value: competitor_market_share, color: "#D92B3A", bg: "rgba(217,43,58,0.1)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Score */}
      <div style={{
        background: scoreBg, border: `1.5px solid ${scoreColor}25`,
        borderRadius: 16, padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div className="mono" style={{ fontSize: 9, color: "#9B9A96", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Survival Score — Round {round}</div>
          <div className="serif" style={{ fontSize: 44, fontWeight: 900, color: scoreColor, letterSpacing: "-0.04em" }}>{survival_score}</div>
          <div style={{ fontSize: 11, color: scoreColor, opacity: 0.8 }}>out of 100</div>
        </div>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          border: `3px solid ${scoreColor}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#fff", flexShrink: 0,
        }}>
          <div style={{ fontSize: 24 }}>
            {survival_score >= 70 ? "✓" : survival_score >= 40 ? "⚡" : "⚠"}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{
        background: "#fff", border: "1px solid var(--border)",
        borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div className="mono" style={{ fontSize: 9, color: "#9B9A96", letterSpacing: "0.15em", textTransform: "uppercase" }}>Shared Memory State</div>
        {metrics.map(m => (
          <div key={m.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, color: "#5C5B58", fontWeight: 500 }}>{m.label}</span>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.value}%</span>
            </div>
            <Bar value={m.value} color={m.color} bg={m.bg} />
          </div>
        ))}
      </div>

      {/* Agent moves */}
      {[
        { label: "Challenger", text: challengerMove, color: "#D92B3A", bg: "#FFF0F1", border: "#FFD5D8", icon: "⚔" },
        { label: "Consumer", text: consumerReaction, color: "#C2680A", bg: "#FFF8EE", border: "#FFE4B5", icon: "◎" },
        { label: "Forecaster", text: forecasterVerdict, color: "#1A7A4A", bg: "#EDFBF3", border: "#B8F0D0", icon: "◈" },
      ].map(a => a.text ? (
        <div key={a.label} style={{
          background: a.bg, border: `1px solid ${a.border}`,
          borderRadius: 14, padding: "16px 18px",
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>{a.icon}</span>
            <span className="mono" style={{ fontSize: 9, fontWeight: 700, color: a.color, letterSpacing: "0.1em" }}>{a.label.toUpperCase()}</span>
          </div>
          <div style={{ fontSize: 13, color: "#5C5B58", lineHeight: 1.65 }}>{a.text}</div>
        </div>
      ) : null)}
    </div>
  );
}
