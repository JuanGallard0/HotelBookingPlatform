"use client";

import { Button } from "@/src/components/ui/button";

export function BookNowButton() {
  function handleClick() {
    document
      .getElementById("availability")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <Button onClick={handleClick} className="hidden lg:block w-full">
      Reservar ahora
    </Button>
  );
}
