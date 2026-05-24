"use client";
import { useEffect, useRef } from "react";

interface Props {
  scores: number[];
  width?: number;
  height?: number;
}

export default function SurvivalGraph({ scores, width = 600, height = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || scores.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const pad = { top: 24, right: 24, bottom: 36, left: 44 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 1;
    [0, 25, 50, 75, 100].forEach(v => {
      const y = pad.top + chartH - (v / 100) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();

      ctx.fillStyle = "#9B9A96";
      ctx.font = "10px 'DM Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(v), pad.left - 8, y + 4);
    });

    if (scores.length < 2) {
      // single point
      const x = pad.left + chartW / 2;
      const y = pad.top + chartH - (scores[0] / 100) * chartH;
      const color = scores[0] >= 70 ? "#1A7A4A" : scores[0] >= 40 ? "#C2680A" : "#D92B3A";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      return;
    }

    const points = scores.map((s, i) => ({
      x: pad.left + (i / (scores.length - 1)) * chartW,
      y: pad.top + chartH - (s / 100) * chartH,
    }));

    // Fill gradient
    const lastScore = scores[scores.length - 1];
    const fillColor = lastScore >= 70 ? "26,122,74" : lastScore >= 40 ? "194,104,10" : "217,43,58";
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0, `rgba(${fillColor},0.15)`);
    grad.addColorStop(1, `rgba(${fillColor},0.0)`);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i-1].x + points[i].x) / 2;
      ctx.bezierCurveTo(cp1x, points[i-1].y, cp1x, points[i].y, points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length-1].x, pad.top + chartH);
    ctx.lineTo(points[0].x, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    const lineColor = lastScore >= 70 ? "#1A7A4A" : lastScore >= 40 ? "#C2680A" : "#D92B3A";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i-1].x + points[i].x) / 2;
      ctx.bezierCurveTo(cp1x, points[i-1].y, cp1x, points[i].y, points[i].x, points[i].y);
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Points + labels
    points.forEach((p, i) => {
      const s = scores[i];
      const c = s >= 70 ? "#1A7A4A" : s >= 40 ? "#C2680A" : "#D92B3A";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = c;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#111110";
      ctx.font = "bold 10px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(s), p.x, p.y - 10);

      ctx.fillStyle = "#9B9A96";
      ctx.font = "9px 'DM Mono', monospace";
      ctx.fillText(`R${i + 1}`, p.x, pad.top + chartH + 18);
    });
  }, [scores]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
