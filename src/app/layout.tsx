import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { ToastProvider } from "@/components/shared/toast-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://chainlearn.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    siteName: "ChainLearn",
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Skip to content
        </a>
        <ErrorBoundary>
          <WalletProvider>
            <ToastProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <AuthProvider>
                  <div id="main-content" className="flex-1">
                    {children}
                  </div>
                </AuthProvider>
                <Footer />
              </div>
            </ToastProvider>
          </WalletProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
