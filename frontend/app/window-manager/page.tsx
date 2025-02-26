"use client";

import { useState } from "react";

export default function WindowManagerPage() {
  const [bounds, setBounds] = useState<null | {
    x: number;
    y: number;
    width: number;
    height: number;
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWindowBounds = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/window-bounds");

      if (!response.ok) {
        throw new Error("Failed to get window bounds");
      }

      const data = await response.json();
      setBounds(data.bounds);
    } catch (err) {
      console.error("Error fetching window bounds:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Window Manager Demo</h1>

      <button
        onClick={getWindowBounds}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed mb-6"
      >
        {loading ? "Loading..." : "Get Current Window Bounds"}
      </button>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}

      {bounds && (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Window Bounds:</h2>
          <pre className="bg-gray-200 dark:bg-gray-700 p-4 rounded overflow-auto">
            {JSON.stringify(bounds, null, 2)}
          </pre>
        </div>
      )}

      <p className="mt-8 text-sm text-gray-500">
        Note: This demo uses the @johnlindquist/node-window-manager package to
        get the bounds of the current window. On macOS, it will request
        accessibility permissions if needed.
      </p>
    </div>
  );
}
