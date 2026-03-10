"use client";

import { useEffect } from "react";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Button } from "@/components/ui/Button";

export default function HotelsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorMessage
        message="Failed to load hotels. Please try again."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </div>
  );
}
