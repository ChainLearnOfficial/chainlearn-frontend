"use client";
// User profile settings page

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { useToastContext } from "@/components/shared/toast";
import { getProfile, updateProfile } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";

const PACE_OPTIONS = [
  { value: "slow", label: "Slow — take my time" },
  { value: "moderate", label: "Moderate — steady pace" },
  { value: "fast", label: "Fast — intensive learning" },
] as const;

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "Portuguese",
  "German",
  "Japanese",
  "Chinese",
  "Korean",
  "Arabic",
  "Hindi",
] as const;

export default function SettingsPage() {
  const { jwt, isAuthenticated, walletAddress } = useAuth();
  const { addToast } = useToastContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [background, setBackground] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [pace, setPace] = useState<"slow" | "moderate" | "fast">("moderate");
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    if (!isAuthenticated || !jwt) {
      router.push("/connect");
      return;
    }

    setLoading(true);
    getProfile(jwt)
      .then((profile) => {
        setDisplayName(profile.displayName ?? "");
        setBackground(profile.background ?? "");
        setLearningGoals((profile.learningGoals ?? []).join(", "));
        setPace(profile.preferredPace ?? "moderate");
      })
      .catch(() => {
        addToast("Failed to load profile", "error");
      })
      .finally(() => setLoading(false));
  }, [jwt, isAuthenticated, router, addToast]);

  const handleSave = async () => {
    if (!jwt) return;
    setSaving(true);
    try {
      await updateProfile(jwt, {
        displayName: displayName.trim(),
        background: background.trim(),
        learningGoals: learningGoals
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
        preferredPace: pace,
      });
      addToast("Profile updated successfully", "success");
    } catch {
      addToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Profile Settings
        </h1>
        <p className="text-gray-500 mt-1 dark:text-gray-400">
          Manage your learning profile and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <label
              htmlFor="displayName"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Display Name
            </label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={50}
            />
          </div>

          {/* Background */}
          <div className="space-y-2">
            <label
              htmlFor="background"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Background
            </label>
            <textarea
              id="background"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Tell us about your background (e.g. software developer, 3 years experience)"
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
              maxLength={500}
            />
          </div>

          {/* Learning Goals */}
          <div className="space-y-2">
            <label
              htmlFor="learningGoals"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Learning Goals
            </label>
            <Input
              id="learningGoals"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              placeholder="e.g. smart contracts, DeFi, Stellar development"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Separate goals with commas
            </p>
          </div>

          {/* Pace */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Learning Pace
            </label>
            <Select value={pace} onValueChange={(v) => setPace(v as typeof pace)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pace" />
              </SelectTrigger>
              <SelectContent>
                {PACE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preferred Language
            </label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wallet address (read-only) */}
          {walletAddress && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Wallet Address
              </label>
              <Input
                value={walletAddress}
                disabled
                className="font-mono text-xs"
              />
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
