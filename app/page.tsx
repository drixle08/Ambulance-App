"use client";

import Button from "../components/Button";
import Card from "../components/Card";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black text-white text-center">
      <h1 className="text-3xl font-bold">Welcome to My App 👋</h1>

      <Card className="max-w-xs">
        <p className="text-lg font-semibold mb-4">
          This is a Card Component
        </p>
        <Button
          label="Click Inside Card"
          onClick={() => alert("Card button clicked")}
        />
      </Card>

      <Link
        href="/dashboard"
        className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
