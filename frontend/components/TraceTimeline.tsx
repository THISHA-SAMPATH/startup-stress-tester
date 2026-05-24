"use client";

interface TraceEntry {
  round: number;
  agent: string;
  action: string;
  timestamp: number;
  survival_score: number;
}

interface Props {
  logs: TraceEntry[];
  filter?: string | number;
}

const AGENT_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  Challenger: { color: "#D92B3A", bg: "#FFF0F1", border: "#FFD5D8" },
  Consumer:   { color: "#C2680A", bg: "#FFF8EE", border: "#FFE4B5" },
  Forecaster: { color: "#1A7A4A", bg: "#EDFBF3", border: "#B8F0D0" },
};

function fmt(ts: number) {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function TraceTimeline({ logs, filter }: Props) {
  const filtered = filter === "all" || filter === undefined
    ? logs
    : logs.filter(l => l.round === Number(filter));

  if (filtered.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#9B9A96" }}>
        <div style={{ fontSize: 13 }}>No trace entries for this selection.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {filtered.map((log, i) => {
        const style = AGENT_STYLE[log.agent] ?? { color: "#3D2FA0", bg: "#EEF0FF", border: "#C5C0F5" };
        const isLast = i === filtered.length - 1;
        return (
          <div key={i} style={{ display: "flex", gap: 16, position: "relative", paddingBottom: isLast ? 0 : 20 }}>
            {/* Vertical line */}
            {!isLast && (
              <div style={{
                position: "absolute", left: 16, top: 32, width: 1,
                height: "calc(100% - 12px)", background: "var(--border)",
              }} />
            )}

            {/* Dot */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: style.bg, border: `1.5px solid ${style.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: style.color, fontWeight: 700, zIndex: 1,
            }}>
              {log.agent[0]}
            </div>

            {/* Content */}
            <div style={{
              flex: 1, background: "#fff", border: "1px solid var(--border)",
              borderRadius: 12, padding: "12px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: style.color,
                    background: style.bg, padding: "2px 8px", borderRadius: 99,
                    border: `1px solid ${style.border}`,
                    fontFamily: "DM Mono, monospace", letterSpacing: "0.05em",
                  }}>{log.agent.toUpperCase()}</span>
                  <span style={{
                    fontSize: 9, color: "#9B9A96",
                    fontFamily: "DM Mono, monospace",
                    background: "var(--bg1)", padding: "2px 6px", borderRadius: 6,
                  }}>R{log.round}</span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: log.survival_score >= 70 ? "#1A7A4A" : log.survival_score >= 40 ? "#C2680A" : "#D92B3A",
                    fontFamily: "DM Mono, monospace",
                  }}>↯ {log.survival_score}</span>
                  <span style={{ fontSize: 9, color: "#9B9A96", fontFamily: "DM Mono, monospace" }}>{fmt(log.timestamp)}</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#5C5B58", lineHeight: 1.6 }}>{log.action}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
