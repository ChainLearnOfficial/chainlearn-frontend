import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ChainLearn - AI-Powered Learning, Rewarded on Stellar",
    template: "%s | ChainLearn",
  },
  description:
    "Earn tokens and verifiable credentials while learning blockchain development on Stellar. Personalized AI-powered courses with on-chain rewards.",
  keywords: [
    "Stellar",
    "blockchain",
    "learning",
    "web3",
    "credentials",
    "rewards",
  ],
  openGraph: {
    title: "ChainLearn - AI-Powered Learning, Rewarded on Stellar",
    description:
      "Earn tokens and verifiable credentials while learning blockchain development on Stellar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans">
        <ErrorBoundary>
          <WalletProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1">
                  <div id="page-content">{children}</div>
                </main>
              </div>
              <MobileNav />
            </div>
          </WalletProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
