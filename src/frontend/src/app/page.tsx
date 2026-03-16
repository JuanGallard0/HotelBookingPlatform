import { Suspense } from "react";
import { Hero } from "@/src/components/home/Hero";
import { HotelsCarousel } from "@/src/components/home/HotelsCarousel";

export default function Home() {
  return (
    <main className="flex-1">
      <Suspense fallback={<section className="min-h-[22rem] bg-linear-to-br from-blue-700 via-blue-600 to-cyan-500" />}>
        <Hero />
      </Suspense>
      <HotelsCarousel />
    </main>
  );
}
