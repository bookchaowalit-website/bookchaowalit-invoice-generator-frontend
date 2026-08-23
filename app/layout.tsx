import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const ledgerSans = DM_Sans({ variable: "--font-ledger-sans", subsets: ["latin"] });
const ledgerMono = DM_Mono({ variable: "--font-ledger-mono", subsets: ["latin"], weight: ["400", "500"] });
const ledgerDisplay = Newsreader({ variable: "--font-ledger-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ledger — THB invoice draft desk",
  description: "Build and review a local THB invoice draft in the browser.",
  metadataBase: new URL("https://invoice-generator.bookchaowalit.com"),
  alternates: { canonical: "https://invoice-generator.bookchaowalit.com" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={ledgerSans.variable + " " + ledgerMono.variable + " " + ledgerDisplay.variable}><body><Analytics /><SpeedInsights />{children}</body></html>;
}
