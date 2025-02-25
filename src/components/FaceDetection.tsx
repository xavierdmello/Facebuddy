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

    // Match canvas dimensions to displayed image size
    const displaySize = {
      width: imageRef.current.clientWidth,
      height: imageRef.current.clientHeight
    };

    // Set canvas size to match the display size
    faceapi.matchDimensions(canvasRef.current, displaySize);

    // Detect faces
    const detections = await faceapi
      .detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    // Resize the detections to match display size
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    console.log(resizedDetections)
    // Clear previous drawings
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw each detection
      resizedDetections.forEach(detection => {
        const drawBox = new faceapi.draw.DrawBox(detection.detection.box, { 
          label: 'Face',
          boxColor: '#00ff00' // Make the box more visible
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
      
      <div className="relative inline-block">
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
              className="absolute top-0 left-0 z-10"
            />
          </>
        )}
      </div>
    </div>
  );
}