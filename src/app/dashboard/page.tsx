"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCourses, useRecommendedCourses } from "@/lib/hooks/use-courses";
import { useRewards } from "@/lib/hooks/use-rewards";
import { useCredentials } from "@/lib/hooks/use-credentials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseCard } from "@/components/course/course-card";
import { ProgressBar } from "@/components/course/progress-bar";
import { BalanceDisplay } from "@/components/wallet/balance-display";
import { CredentialCard } from "@/components/credentials/credential-card";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
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

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { courses, enrollments, loading: coursesLoading } = useCourses();
  const { recommended, loading: recommendedLoading } = useRecommendedCourses();
  const { balances, loading: rewardsLoading } = useRewards();
  const { credentials, loading: credentialsLoading } = useCredentials();
  const progress = useCourseStore((s) => s.progress);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/connect");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

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

  const totalBalance =
    balances.reduce((sum, b) => sum + parseFloat(b.balance || "0"), 0) /
    Math.pow(10, balances[0]?.decimals ?? 7);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Continue your learning journey.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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

      {/* Enrolled Courses */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500">You haven&apos;t enrolled in any courses yet.</p>
              <Link href="/courses">
                <Button className="mt-4" size="sm">
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
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

      {/* Two column: Recommended + Recent Credentials */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recommended */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recommended for You
          </h2>
          {recommended.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-sm text-gray-500">
                Complete your profile to get personalized recommendations.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recommended.slice(0, 3).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Credentials */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Credentials
          </h2>
          {credentials.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-sm text-gray-500">
                Complete courses to earn verifiable credentials.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {credentials.slice(0, 3).map((cred) => (
                <CredentialCard key={cred.id} credential={cred} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
