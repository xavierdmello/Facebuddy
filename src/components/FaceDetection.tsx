 'use client';

import * as faceapi from 'face-api.js';

import { useEffect, useRef, useState } from 'react';

export default function FaceDetection() {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const detectFaces = async () => {
    if (!imageRef.current || !canvasRef.current || !isModelLoaded) return;

    // Set canvas dimensions to match image
    canvasRef.current.width = imageRef.current.width;
    canvasRef.current.height = imageRef.current.height;

    // Detect faces
    const detections = await faceapi
      .detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    console.log(detections)

    // Draw results
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      detections.forEach(detection => {
        const box = detection.detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { 
          label: 'Face' 
        });
        drawBox.draw(canvasRef.current!);
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />
      
      <div className="relative">
        {selectedImage && (
          <>
            <img
              ref={imageRef}
              src={selectedImage}
              alt="Selected"
              className="max-w-[450px] rounded-xl"
              onLoad={detectFaces}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0"
            />
          </>
        )}
      </div>
    </div>
  );
}