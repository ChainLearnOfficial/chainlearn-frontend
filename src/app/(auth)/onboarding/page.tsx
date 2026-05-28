"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { updateProfile } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Target, Zap, ArrowRight } from "lucide-react";

const backgrounds = [
  "Beginner - New to blockchain",
  "Developer - Some coding experience",
  "Experienced - Familiar with blockchain",
  "Expert - Building on Stellar already",
];

const goals = [
  "Learn Stellar basics",
  "Build smart contracts",
  "Understand DeFi",
  "Earn credentials for career",
  "Explore Soroban",
];

const paces = [
  { value: "slow", label: "Casual", description: "A few hours per week" },
  { value: "moderate", label: "Steady", description: "30 min per day" },
  { value: "fast", label: "Intensive", description: "1+ hour per day" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const jwt = useAuthStore((s) => s.jwt);
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [background, setBackground] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [pace, setPace] = useState<"slow" | "moderate" | "fast">("moderate");
  const [saving, setSaving] = useState(false);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    if (!jwt) return;
    setSaving(true);
    try {
      await updateProfile(jwt, {
        displayName,
        background,
        learningGoals: selectedGoals,
        preferredPace: pace,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    /* Step 0: Name */
    <div key="name" className="space-y-6">
      <div className="text-center">
        <User className="mx-auto h-10 w-10 text-stellar-purple mb-3" />
        <h2 className="text-xl font-semibold">What should we call you?</h2>
        <p className="text-sm text-gray-500 mt-1">
          This will be displayed on your profile.
        </p>
      </div>
      <Input
        placeholder="Your display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="text-center text-lg"
      />
      <Button
        onClick={() => setStep(1)}
        disabled={!displayName.trim()}
        className="w-full"
      >
        Continue <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>,

    /* Step 1: Background */
    <div key="background" className="space-y-6">
      <div className="text-center">
        <Target className="mx-auto h-10 w-10 text-stellar-purple mb-3" />
        <h2 className="text-xl font-semibold">Your Background</h2>
        <p className="text-sm text-gray-500 mt-1">
          Help us personalize your learning path.
        </p>
      </div>
      <div className="space-y-2">
        {backgrounds.map((bg) => (
          <button
            key={bg}
            onClick={() => setBackground(bg)}
            className={`w-full rounded-lg border p-3 text-left text-sm transition-all ${
              background === bg
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {bg}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
          Back
        </Button>
        <Button
          onClick={() => setStep(2)}
          disabled={!background}
          className="flex-1"
        >
          Continue <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>,

    /* Step 2: Goals */
    <div key="goals" className="space-y-6">
      <div className="text-center">
        <Zap className="mx-auto h-10 w-10 text-stellar-purple mb-3" />
        <h2 className="text-xl font-semibold">Learning Goals</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select what you want to achieve (pick up to 3).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {goals.map((goal) => (
          <button
            key={goal}
            onClick={() => toggleGoal(goal)}
            disabled={
              !selectedGoals.includes(goal) && selectedGoals.length >= 3
            }
            className={`rounded-full border px-4 py-2 text-sm transition-all ${
              selectedGoals.includes(goal)
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-gray-200 hover:border-gray-300 text-gray-600"
            }`}
          >
            {goal}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button
          onClick={() => setStep(3)}
          disabled={selectedGoals.length === 0}
          className="flex-1"
        >
          Continue <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>,

    /* Step 3: Pace */
    <div key="pace" className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Learning Pace</h2>
        <p className="text-sm text-gray-500 mt-1">
          How much time can you dedicate?
        </p>
      </div>
      <div className="space-y-2">
        {paces.map((p) => (
          <button
            key={p.value}
            onClick={() => setPace(p.value as typeof pace)}
            className={`w-full rounded-lg border p-4 text-left transition-all ${
              pace === p.value
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="font-medium text-gray-900">{p.label}</p>
            <p className="text-sm text-gray-500">{p.description}</p>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
          Back
        </Button>
        <Button onClick={handleComplete} disabled={saving} className="flex-1">
          {saving ? "Saving..." : "Complete Setup"}
        </Button>
      </div>
    </div>,
  ];

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center gap-2 mb-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-12 rounded-full transition-colors ${
                  i <= step ? "bg-primary-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-center">Set Up Your Profile</CardTitle>
          <CardDescription className="text-center">
            Step {step + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>{steps[step]}</CardContent>
      </Card>
    </div>
  );
}
