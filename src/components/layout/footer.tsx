import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stellar-purple">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">ChainLearn</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built on Stellar. Learn, earn, and verify.
          </p>
        </div>
      </div>
    </footer>
  );
}
