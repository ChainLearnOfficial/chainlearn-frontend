"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { ArrowRight, GraduationCap } from "lucide-react";

export function HeroCTA() {
  const { isAuthenticated, connectWallet, isConnecting } = useAuth();

  return (
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
  );
}
