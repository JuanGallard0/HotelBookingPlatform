import { Hero } from "@/src/components/home/Hero";
import { HotelsCarousel } from "@/src/components/home/HotelsCarousel";
import { Navbar } from "@/src/components/home/Navbar";
import { Footer } from "@/src/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <HotelsCarousel />
      </main>

      <Footer />
    </div>
  );
}
