"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function FaceDetection() {
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const detectFace = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/detect-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imagePath: "/1.jpg" }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.boundingBox) {
        setBoundingBox(data.boundingBox);
      } else {
        setError("No face detected or invalid response from API");
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  }, []);

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Face Detection with Qwen2-VL-72B
        </h1>

        <div className="flex flex-col items-center mb-8">
          <button
            onClick={detectFace}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Detecting..." : "Detect Face"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="relative inline-block mx-auto">
          <img
            ref={imageRef}
            src="/1.jpg"
            alt="Image for face detection"
            className="max-w-full h-auto"
            onLoad={handleImageLoad}
          />

          {boundingBox && (
            <div
              className="absolute border-4 border-green-500 pointer-events-none"
              style={{
                left: `${boundingBox.x}px`,
                top: `${boundingBox.y}px`,
                width: `${boundingBox.width}px`,
                height: `${boundingBox.height}px`,
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
