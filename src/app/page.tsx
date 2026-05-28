"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  BookOpen,
  Trophy,
  Award,
  Zap,
  ArrowRight,
  GraduationCap,
  Shield,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Personalization",
    description:
      "Courses adapt to your background, goals, and learning pace for maximum effectiveness.",
  },
  {
    icon: Trophy,
    title: "Token Rewards",
    description:
      "Earn LEARN tokens on the Stellar network as you complete courses and pass quizzes.",
  },
  {
    icon: Award,
    title: "Verifiable Credentials",
    description:
      "Receive on-chain credential NFTs that prove your skills to employers and peers.",
  },
  {
    icon: Zap,
    title: "Fast & Low-Cost",
    description:
      "Built on Stellar for near-instant transactions with minimal fees.",
  },
];

export default function LandingPage() {
  const { isAuthenticated, connectWallet, isConnecting } = useAuth();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-stellar-purple/10 px-4 py-1.5 text-sm font-medium text-stellar-purple">
              <Zap className="h-4 w-4" />
              Powered by Stellar
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              AI-Powered Learning,{" "}
              <span className="bg-gradient-to-r from-stellar-purple to-stellar-blue bg-clip-text text-transparent">
                Rewarded on Stellar
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl">
              Master blockchain development with personalized courses that adapt
              to you. Earn token rewards and verifiable credentials as you
              progress, all secured on the Stellar network.
            </p>
            <div className="mt-10 flex items-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="gap-2"
                >
                  <GraduationCap className="h-5 w-5" />
                  {isConnecting ? "Connecting..." : "Connect Wallet to Start"}
                </Button>
              )}
              <Link href="/courses">
                <Button variant="outline" size="lg">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why ChainLearn?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              A new paradigm in education where learning is personalized,
              rewarded, and verifiable on-chain.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stellar-purple/10 mb-4">
                  <feature.icon className="h-6 w-6 text-stellar-purple" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Connect Your Wallet",
                description:
                  "Link your Stellar wallet via Freighter to get started. Your wallet is your identity.",
                icon: Shield,
              },
              {
                step: "2",
                title: "Learn & Complete",
                description:
                  "Browse courses, study modules, and pass quizzes. Content adapts to your level and pace.",
                icon: BookOpen,
              },
              {
                step: "3",
                title: "Earn & Verify",
                description:
                  "Receive LEARN tokens and credential NFTs. Share your credentials anywhere as proof of skill.",
                icon: Award,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                  <item.icon className="h-8 w-8 text-stellar-purple" />
                </div>
                <div className="text-sm font-medium text-stellar-purple mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-stellar-purple to-stellar-blue">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Start Learning?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join thousands of learners earning tokens and credentials on Stellar.
          </p>
          <div className="mt-8">
            {isAuthenticated ? (
              <Link href="/courses">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2"
                >
                  Explore Courses
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                onClick={connectWallet}
                disabled={isConnecting}
                className="gap-2"
              >
                <GraduationCap className="h-5 w-5" />
                {isConnecting ? "Connecting..." : "Get Started Free"}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stellar-purple">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                ChainLearn
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Built on Stellar. Learn, earn, and verify.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
