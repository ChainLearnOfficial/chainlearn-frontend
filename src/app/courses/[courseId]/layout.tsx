import type { Metadata } from "next";
import { apiClient } from "@/lib/api/client";
import type { Course } from "@/types/course";

interface PageProps {
  params: { courseId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = params;

  try {
    const response = await apiClient.get<Course>(`/courses/${courseId}`);
    const course = response.data;
    const images = course.imageUrl
      ? [
          {
            url: course.imageUrl,
            width: 1200,
            height: 630,
            alt: course.title,
          },
        ]
      : undefined;

    return {
      title: course.title,
      description: course.description,
      openGraph: {
        title: `${course.title} | ChainLearn`,
        description: course.description,
        type: "article",
        images,
      },
      twitter: {
        card: "summary_large_image",
        title: `${course.title} | ChainLearn`,
        description: course.description,
        images: course.imageUrl ? [course.imageUrl] : undefined,
      },
    };
  } catch {
    return {
      title: "Course",
      description: "View course details on ChainLearn.",
      openGraph: {
        title: "Course | ChainLearn",
        description: "View course details on ChainLearn.",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "Course | ChainLearn",
        description: "View course details on ChainLearn.",
      },
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
