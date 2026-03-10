"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Button } from "@/components/ui/Button";

export default function HotelError({
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorMessage
        message="Failed to load hotel details. Please try again."
        action={
          <div className="flex gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button variant="secondary">
              <Link href="/hotels">Back to hotels</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
