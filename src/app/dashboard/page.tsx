"use client";

import { Component, type ReactNode } from "react";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { useCourses, useRecommendedCourses } from "@/lib/hooks/use-courses";
import { useRewards } from "@/lib/hooks/use-rewards";
import { useCredentials } from "@/lib/hooks/use-credentials";
import { Card, CardContent } from "@/components/ui/card";
import { CourseCard } from "@/components/course/course-card";
import { CourseProgressCard } from "@/components/course/course-progress-card";
import { BalanceDisplay } from "@/components/wallet/balance-display";
import { RewardHistory } from "@/components/rewards/reward-history";
import { CredentialCard } from "@/components/credentials/credential-card";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StatsCard } from "@/components/shared/stats-card";
import { useCourseStore } from "@/store/course-store";
import {
  BookOpen,
  Trophy,
  Award,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// #488 — lightweight per-section error boundary so one failing section
// (rewards, credentials, etc.) never takes down the whole dashboard.
class SectionErrorBoundary extends Component<
  { label: string; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardContent className="py-6 text-center">
            <AlertTriangle className="mx-auto h-5 w-5 text-amber-500 mb-2" />
            <p className="text-sm text-gray-600">
              {this.props.label} failed to load. Other sections are unaffected.
            </p>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

function SectionError({ label, message }: { label: string; message: string }) {
  return (
    <Card>
      <CardContent className="py-6 text-center">
        <AlertTriangle className="mx-auto h-5 w-5 text-amber-500 mb-2" />
        <p className="text-sm text-gray-600">{label}: {message}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { ready } = useRequireAuth();
  const { courses, enrollments, loading: coursesLoading, error: coursesError } = useCourses();
  const { recommended, loading: recommendedLoading, error: recommendedError } = useRecommendedCourses();
  const { balances, history, loading: rewardsLoading, error: rewardsError } = useRewards();
  const { credentials, loading: credentialsLoading, error: credentialsError } = useCredentials();
  const progress = useCourseStore((s) => s.progress);

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const isLoading =
    coursesLoading || rewardsLoading || credentialsLoading || recommendedLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const enrolledCourses = enrollments.map((e) => {
    const course = courses.find((c) => c.id === e.courseId);
    return { enrollment: e, course };
  });

  const totalBalance = balances.reduce((sum, b) => {
    const raw = parseFloat(b.balance || "0");
    const divisor = Math.pow(10, b.decimals ?? 7);
    return sum + raw / divisor;
  }, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Continue your learning journey.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              icon={BookOpen}
              label="Enrolled Courses"
              value={enrollments.length}
              color="primary"
            />
            <StatsCard
              icon={TrendingUp}
              label="Completed"
              value={enrollments.filter((e) => e.progress === 100).length}
              color="success"
            />
            <StatsCard
              icon={Trophy}
              label="LEARN Tokens"
              value={totalBalance.toFixed(1)}
              color="purple"
            />
            <StatsCard
              icon={Award}
              label="Credentials"
              value={credentials.length}
              color="warning"
            />
          </div>

          <SectionErrorBoundary label="Recommendations">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recommended for You
              </h2>
              {recommendedError ? (
                <SectionError label="Recommendations" message={recommendedError} />
              ) : recommended.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-sm text-gray-500">
                    Complete your profile to get personalized recommendations.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recommended.slice(0, 3).map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </section>
          </SectionErrorBoundary>
        </TabsContent>

        <TabsContent value="courses" className="focus-visible:outline-none focus-visible:ring-0">
          <SectionErrorBoundary label="Courses">
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                <Link href="/courses">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Browse Catalog <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              {coursesError ? (
                <SectionError label="Courses" message={coursesError} />
              ) : enrolledCourses.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No Courses Yet"
                  description="You haven't enrolled in any courses yet."
                  action={
                    <Link href="/courses">
                      <Button size="sm">Explore Courses</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {enrolledCourses.map(({ enrollment, course }) => (
                    <CourseProgressCard
                      key={enrollment.id}
                      courseId={enrollment.courseId}
                      courseTitle={course?.title || "Course"}
                      progress={
                        progress[enrollment.courseId]?.progressPercent ??
                        enrollment.progress
                      }
                      completedModules={enrollment.completedModules?.length}
                      moduleCount={course?.totalModules}
                    />
                  ))}
                </div>
              )}
            </section>
          </SectionErrorBoundary>
        </TabsContent>

        <TabsContent value="credentials" className="focus-visible:outline-none focus-visible:ring-0">
          <SectionErrorBoundary label="Credentials">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                My Credentials
              </h2>
              {credentialsError ? (
                <SectionError label="Credentials" message={credentialsError} />
              ) : credentials.length === 0 ? (
                <EmptyState
                  icon={Award}
                  title="No Credentials Yet"
                  description="You haven't earned any credentials yet. Complete courses to earn verifiable credentials on the Stellar network."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {credentials.map((cred) => (
                    <CredentialCard key={cred.id} credential={cred} />
                  ))}
                </div>
              )}
            </section>
          </SectionErrorBoundary>
        </TabsContent>

        <TabsContent value="rewards" className="focus-visible:outline-none focus-visible:ring-0">
          <SectionErrorBoundary label="Rewards">
            {rewardsError ? (
              <SectionError label="Rewards" message={rewardsError} />
            ) : (
              <>
                <section className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Rewards Balance
                  </h2>
                  <Card>
                    <CardContent className="p-6">
                      <BalanceDisplay />
                    </CardContent>
                  </Card>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Reward History
                  </h2>
                  <Card>
                    <CardContent className="p-6">
                      <RewardHistory claims={history} />
                    </CardContent>
                  </Card>
                </section>
              </>
            )}
          </SectionErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
