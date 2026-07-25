import type { Metadata } from "next";
import { apiClient } from "@/lib/api/client";
import type { Course } from "@/types/course";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;

  try {
    const response = await apiClient.get<Course>(`/courses/${courseId}`);
    const course = response.data;

    return {
      title: course.title,
      description: course.description,
      openGraph: {
        title: `${course.title} | ChainLearn`,
        description: course.description,
        type: "article",
      },
    };
  } catch {
    return {
      title: "Course",
      description: "View course details on ChainLearn.",
    };
  }
}

export default async function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
