"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BottomCTA() {
  const { isAuthenticated, connectWallet, isConnecting } = useAuth();

  return (
    <div className="mt-8">
      {isAuthenticated ? (
        <Link href="/courses">
          <Button size="lg" variant="secondary" className="gap-2">
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
  );
}
