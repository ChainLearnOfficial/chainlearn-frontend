"use client";

import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { useCourses, useRecommendedCourses } from "@/lib/hooks/use-courses";
import { useRewards } from "@/lib/hooks/use-rewards";
import { useCredentials } from "@/lib/hooks/use-credentials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseCard } from "@/components/course/course-card";
import { ProgressBar } from "@/components/course/progress-bar";
import { BalanceDisplay } from "@/components/wallet/balance-display";
import { CredentialCard } from "@/components/credentials/credential-card";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useCourseStore } from "@/store/course-store";
import {
  BookOpen,
  Trophy,
  Award,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { ready } = useRequireAuth();
  const { courses, enrollments, loading: coursesLoading } = useCourses();
  const { recommended, loading: recommendedLoading, error: recommendedError } = useRecommendedCourses();
  const { balances, loading: rewardsLoading } = useRewards();
  const { credentials, loading: credentialsLoading } = useCredentials();
  const progress = useCourseStore((s) => s.progress);

  if (!ready) return null;

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
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                  <p className="text-xs text-gray-500">Enrolled Courses</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {enrollments.filter((e) => e.progress === 100).length}
                  </p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stellar-purple/10">
                  <Trophy className="h-5 w-5 text-stellar-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalBalance.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">LEARN Tokens</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{credentials.length}</p>
                  <p className="text-xs text-gray-500">Credentials</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recommended for You
            </h2>
            {recommendedError ? (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-sm text-red-600">{recommendedError}</p>
                </CardContent>
              </Card>
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
        </TabsContent>

        <TabsContent value="courses" className="focus-visible:outline-none focus-visible:ring-0">
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
              <Link href="/courses">
                <Button variant="ghost" size="sm" className="gap-1">
                  Browse Catalog <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            {enrolledCourses.length === 0 ? (
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
                  <Card key={enrollment.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {course?.title || "Course"}
                      </h3>
                      <ProgressBar
                        value={progress[enrollment.courseId]?.progressPercent ?? enrollment.progress}
                      />
                      <Link href={`/courses/${enrollment.courseId}`}>
                        <Button variant="ghost" size="sm" className="mt-3 w-full">
                          Continue Learning
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="credentials" className="focus-visible:outline-none focus-visible:ring-0">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              My Credentials
            </h2>
            {credentials.length === 0 ? (
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
        </TabsContent>

        <TabsContent value="rewards" className="focus-visible:outline-none focus-visible:ring-0">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
