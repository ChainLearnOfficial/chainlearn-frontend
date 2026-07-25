import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-stellar-purple/10">
        <LayoutDashboard className="h-8 w-8 text-stellar-purple" />
      </div>
      <h1 className="mb-2 text-6xl font-bold text-gray-900">404</h1>
      <h2 className="mb-4 text-xl font-semibold text-gray-700">
        Dashboard Not Found
      </h2>
      <p className="mb-8 max-w-md text-gray-500">
        The dashboard page you are looking for does not exist. Return to your
        dashboard to view your progress.
      </p>
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/">
          <Button className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
