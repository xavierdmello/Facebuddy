"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Screenshot() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number>(Date.now());

  const captureScreenshot = async () => {
    setLoading(true);
    setError(null);

    try {
      // Update timestamp to force image refresh
      const newTimestamp = Date.now();
      setTimestamp(newTimestamp);
      setScreenshotUrl(`/api/screenshot?t=${newTimestamp}`);
    } catch (err) {
      setError("An error occurred while capturing screenshot");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    captureScreenshot();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Screenshot Window</h2>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={captureScreenshot}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Capturing..." : "Capture Window Screenshot"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mt-6 border rounded-lg overflow-hidden shadow-md">
        {screenshotUrl ? (
          <div className="relative w-full h-[500px]">
            <Image
              src={screenshotUrl}
              alt="Bezel Screenshot"
              fill
              style={{ objectFit: "contain" }}
              onError={() => {
                setError(
                  "Failed to load screenshot. App might not be running."
                );
                setScreenshotUrl(null);
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[500px] bg-gray-100 text-gray-500">
            {loading ? "Capturing screenshot..." : "No screenshot available"}
          </div>
        )}
      </div>
    </div>
  );
}
