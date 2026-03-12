"use client";

export function BookNowButton() {
  function handleClick() {
    document
      .getElementById("availability")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <button
      onClick={handleClick}
      className="hidden lg:block w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
    >
      Reservar ahora
    </button>
  );
}
