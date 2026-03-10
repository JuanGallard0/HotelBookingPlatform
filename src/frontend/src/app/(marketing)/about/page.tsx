import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about StayFinder — our mission, team, and commitment to making hotel booking effortless.",
};

const TEAM = [
  { name: "Maria García", role: "CEO & Co-founder" },
  { name: "James Chen", role: "CTO & Co-founder" },
  { name: "Priya Patel", role: "Head of Product" },
] as const;

const VALUES = [
  {
    title: "Transparency",
    description:
      "No hidden fees. The price you see is the price you pay, always.",
  },
  {
    title: "Reliability",
    description:
      "Every hotel is verified. Every booking is guaranteed or we make it right.",
  },
  {
    title: "Simplicity",
    description:
      "Booking a hotel should take seconds, not minutes. We designed for that.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Travel made simple
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            StayFinder was founded on the belief that finding a great hotel
            should be as easy as a web search. We&apos;re a team of travellers
            building the tools we always wished existed.
          </p>
        </div>
      </section>

      {/* Values */}
      <section
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        aria-labelledby="values-heading"
      >
        <h2
          id="values-heading"
          className="mb-10 text-center text-2xl font-bold text-gray-900"
        >
          What we stand for
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {VALUES.map(({ title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section
        className="border-t border-gray-200 bg-gray-50 py-16"
        aria-labelledby="team-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="team-heading"
            className="mb-10 text-center text-2xl font-bold text-gray-900"
          >
            The team
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {TEAM.map(({ name, role }) => (
              <div key={name} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                  {name[0]}
                </div>
                <p className="mt-3 font-medium text-gray-900">{name}</p>
                <p className="text-sm text-gray-500">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Ready to find your stay?
          </h2>
          <p className="mt-3 text-gray-500">
            Browse thousands of hotels and book in seconds.
          </p>
          <Link
            href="/hotels"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Explore hotels
          </Link>
        </div>
      </section>
    </>
  );
}
