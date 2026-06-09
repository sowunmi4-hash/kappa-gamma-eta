import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import PageTracker from "./components/PageTracker";

export const metadata: Metadata = {
  title: "Kappa Gamma Eta — ΚΓΗ",
  description: "She is strong like whiskey, but soft like wine. Est. 12.14.24",
  openGraph: {
    title: "Kappa Gamma Eta — ΚΓΗ",
    description: "She is strong like whiskey, but soft like wine.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <PageTracker />
      </body>
    </html>
  );
}
