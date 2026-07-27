import { createOgImage, OG_SIZE } from "@/lib/utils/og-image";
import type { Course } from "@/types/course";

export const alt = "ChainLearn course";
export const size = OG_SIZE;
export const contentType = "image/png";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ImageProps {
  params: { courseId: string };
}

export default async function Image({ params }: ImageProps) {
  const { courseId } = params;
  let title = "Course on ChainLearn";
  let description =
    "Earn tokens and verifiable credentials while learning on Stellar.";

  try {
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const payload = (await response.json()) as { data?: Course } & Course;
      const course = payload.data ?? payload;
      title = course.title;
      description = course.description.slice(0, 140);
    }
  } catch {
    // Fall back to generic course copy when the catalog is unavailable.
  }

  return createOgImage({
    eyebrow: "ChainLearn · Course",
    title,
    description,
  });
}
