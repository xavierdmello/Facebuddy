'use client';

import * as faceapi from 'face-api.js';

import { useEffect, useRef, useState } from 'react';

import { ProfileData } from './FaceRegistration';

interface SavedFace {
  label: ProfileData;
  descriptor: Float32Array;
}

interface Props {
  savedFaces: SavedFace[];
}

export default function FaceRecognition({ savedFaces }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const faceMatcher = useRef<faceapi.FaceMatcher | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (savedFaces.length > 0) {
      const labeledDescriptors = savedFaces.reduce((acc: faceapi.LabeledFaceDescriptors[], face) => {
        const existing = acc.find(ld => ld.label === face.label.name);
        if (existing) {
          existing.descriptors.push(face.descriptor);
        } else {
          acc.push(new faceapi.LabeledFaceDescriptors(face.label.name, [face.descriptor]));
        }
        return acc;
      }, []);

      faceMatcher.current = new faceapi.FaceMatcher(labeledDescriptors);
    }
  }, [savedFaces]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const detectFaces = async () => {
    if (!imageRef.current || !canvasRef.current || !isModelLoaded || !faceMatcher.current) return;

    const displaySize = {
      width: imageRef.current.clientWidth,
      height: imageRef.current.clientHeight
    };

    faceapi.matchDimensions(canvasRef.current, displaySize);

    const fullFaceDescriptions = await faceapi
      .detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(fullFaceDescriptions, displaySize);

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      resizedDetections.forEach(({ detection, descriptor }) => {
        const match = faceMatcher.current!.findBestMatch(descriptor);
        const matchedFace = savedFaces.find(face => face.label.name === match.label);
        let label = `${match.label} (${Math.round(100 - match.distance * 100)}%)`;
        
        if (matchedFace) {
          const socialLinks = [];
          if (matchedFace.label.linkedin) socialLinks.push(`LinkedIn: ${matchedFace.label.linkedin}`);
          if (matchedFace.label.telegram) socialLinks.push(`Telegram: ${matchedFace.label.telegram}`);
          if (socialLinks.length > 0) {
            label += `\n${socialLinks.join(' | ')}`;
          }
        }
        
        const drawBox = new faceapi.draw.DrawBox(detection.box, { 
          label,
          boxColor: '#00ff00'
        });
        drawBox.draw(canvasRef.current!);
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Recognize Faces</h2>
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