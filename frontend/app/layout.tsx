import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Startup Stress Tester — Battle-test your idea",
  description: "Three adversarial AI agents simulate real market pressure on your startup idea before you build.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
