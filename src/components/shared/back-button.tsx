'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="mb-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
      Back
    </Button>
  );
}
