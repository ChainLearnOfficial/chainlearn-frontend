import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-stellar-purple/10">
        <BookOpen className="h-8 w-8 text-stellar-purple" />
      </div>
      <h1 className="mb-2 text-6xl font-bold text-gray-900">404</h1>
      <h2 className="mb-4 text-xl font-semibold text-gray-700">
        Course Not Found
      </h2>
      <p className="mb-8 max-w-md text-gray-500">
        This course does not exist or has been removed. Browse our available
        courses to continue learning.
      </p>
      <div className="flex items-center gap-4">
        <Link href="/courses">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Browse Courses
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button className="gap-2">
            <BookOpen className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
