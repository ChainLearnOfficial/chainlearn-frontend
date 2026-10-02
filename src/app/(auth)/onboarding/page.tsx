"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { updateProfile } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { User, Target, Zap, ArrowRight, Languages } from "lucide-react";
import { useToastContext } from "@/components/shared/toast";

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

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "pt", label: "Portuguese" },
];

/**
 * OnboardingPage provides a multi-step setup flow for new users.
 * Collects display name, learning background, goals, and preferred pace
 * to personalize the user's learning path.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const jwt = useAuthStore((s) => s.jwt);
  const { addToast } = useToastContext();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [pace, setPace] = useState<"slow" | "moderate" | "fast">("moderate");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleNext = () => {
    if (step === 0) {
      const trimmed = displayName.trim();
      if (
        trimmed.length < 2 ||
        trimmed.length > 50 ||
        /[\r\n\t\0<>]/.test(trimmed)
      ) {
        addToast(
          "Enter a valid display name between 2 and 50 characters.",
          "error",
        );
        return;
      }
    }
    if (step === 1 && selectedGoals.length === 0) {
      addToast("Select at least one learning goal.", "error");
      return;
    }
    setStep((current) => Math.min(current + 1, 3));
  };

  const handleComplete = async () => {
    if (!jwt) return;

    const trimmed = displayName.trim();
    if (!trimmed) {
      addToast("Display name cannot be empty.", "error");
      setStep(0);
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 50) {
      addToast("Display name must be between 2 and 50 characters.", "error");
      setStep(0);
      return;
    }
    if (/[\r\n\t\0<>]/.test(trimmed)) {
      addToast("Display name contains invalid characters.", "error");
      setStep(0);
      return;
    }

    setSaving(true);
    try {
      await updateProfile(jwt, {
        displayName: trimmed,
        learningGoals: selectedGoals,
        preferredPace: pace,
        language,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to save profile:", err);
      addToast("Failed to save profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => router.push("/dashboard");

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
      <Button onClick={handleNext} className="w-full">
        Continue <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>,

    /* Step 1: Learning goals */
    <div key="goals" className="space-y-6">
      <div className="text-center">
        <Target className="mx-auto h-10 w-10 text-stellar-purple mb-3" />
        <h2 className="text-xl font-semibold">Learning Goals</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select what you want to achieve (pick up to 3).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {goals.map((goal) => (
          <button
            key={goal}
            type="button"
            aria-pressed={selectedGoals.includes(goal)}
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
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Continue <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>,

    /* Step 2: Pace and language */
    <div key="preferences" className="space-y-6">
      <div className="text-center">
        <Zap className="mx-auto h-10 w-10 text-stellar-purple mb-3" />
        <h2 className="text-xl font-semibold">Your Preferences</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a learning pace and language.
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Learning pace</p>
        {paces.map((p) => (
          <button
            key={p.value}
            type="button"
            aria-pressed={pace === p.value}
            onClick={() => setPace(p.value as typeof pace)}
            className={`w-full rounded-lg border p-3 text-left transition-all ${
              pace === p.value
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="font-medium">{p.label}</span>
            <span className="ml-2 text-sm text-gray-500">{p.description}</span>
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Language</p>
        <div className="flex flex-wrap gap-2">
          {languages.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={language === item.value}
              onClick={() => setLanguage(item.value)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                language === item.value
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Continue <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>,

    /* Step 3: Review */
    <div key="review" className="space-y-6">
      <div className="text-center">
        <Languages className="mx-auto h-10 w-10 text-stellar-purple mb-3" />
        <h2 className="text-xl font-semibold">Review Your Profile</h2>
        <p className="text-sm text-gray-500 mt-1">
          Make sure everything looks right before you continue.
        </p>
      </div>
      <dl className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
        <div>
          <dt className="font-medium">Display name</dt>
          <dd>{displayName.trim()}</dd>
        </div>
        <div>
          <dt className="font-medium">Learning goals</dt>
          <dd>{selectedGoals.join(", ")}</dd>
        </div>
        <div>
          <dt className="font-medium">Pace</dt>
          <dd>{paces.find((item) => item.value === pace)?.label}</dd>
        </div>
        <div>
          <dt className="font-medium">Language</dt>
          <dd>{languages.find((item) => item.value === language)?.label}</dd>
        </div>
      </dl>
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
      <Card className="relative w-full max-w-md">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute right-4 top-4"
          >
            Skip
          </Button>
        </CardHeader>
        <CardContent>{steps[step]}</CardContent>
      </Card>
    </div>
  );
}
