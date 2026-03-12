import { Hero } from "@/src/components/home/Hero";
import { HotelsCarousel } from "@/src/components/home/HotelsCarousel";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <HotelsCarousel />
    </main>
  );
}
