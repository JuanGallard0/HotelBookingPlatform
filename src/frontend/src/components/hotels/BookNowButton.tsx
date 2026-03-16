"use client";

import { Button } from "@/src/components/ui/button";

export function BookNowButton() {
  function handleClick() {
    const el = document.getElementById("availability");
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => {
      el.style.transition = "box-shadow 0.35s ease";
      el.style.borderRadius = "1rem";
      el.style.boxShadow = [
        "0 0 0 2px color-mix(in oklch, var(--primary) 80%, transparent)",
        "0 0 28px color-mix(in oklch, var(--primary) 30%, transparent)",
      ].join(", ");

      setTimeout(() => {
        el.style.boxShadow = "none";
        setTimeout(() => {
          el.style.transition = "";
          el.style.borderRadius = "";
        }, 350);
      }, 1800);
    }, 600);
  }

  return (
    <Button onClick={handleClick} className="hidden lg:block w-full">
      Reservar ahora
    </Button>
  );
}
