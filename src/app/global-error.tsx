"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center font-sans">
        <h1 className="text-6xl font-bold">500</h1>
        <h2 className="text-xl text-gray-600">Something went wrong</h2>
        <p className="max-w-md text-sm text-gray-500">
          A critical error occurred. Please try refreshing the page.
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
