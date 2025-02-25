'use client';

import * as faceapi from 'face-api.js';

import { useEffect, useRef, useState } from 'react';

interface SavedFace {
  label: string;
  descriptor: Float32Array;
}

interface Props {
  onFaceSaved: (faces: SavedFace[]) => void;
}

export default function FaceRegistration({ onFaceSaved }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [personName, setPersonName] = useState<string>('');

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const detectFaces = async () => {
    if (!imageRef.current || !canvasRef.current || !isModelLoaded) return;

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

      resizedDetections.forEach(({ detection }) => {
        const drawBox = new faceapi.draw.DrawBox(detection.box, { 
          label: 'Face',
          boxColor: '#00ff00'
        });
        drawBox.draw(canvasRef.current!);
      });
    }
  };

  const saveFaces = async () => {
    if (!imageRef.current || !isModelLoaded || !personName) {
      alert('Please enter a name and select an image');
      return;
    }

    const fullFaceDescriptions = await faceapi
      .detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!fullFaceDescriptions.length) {
      alert('No faces detected to save!');
      return;
    }

    const savedFaces: SavedFace[] = fullFaceDescriptions.map(fd => ({
      label: personName,
      descriptor: fd.descriptor
    }));

    onFaceSaved(savedFaces);
    alert(`Saved ${savedFaces.length} faces for ${personName}!`);
    setPersonName('');
    setSelectedImage(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Register New Face</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="Enter person's name"
          className="px-2 py-1 border rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4"
        />
        <button
          onClick={saveFaces}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Face
        </button>
      </div>
      
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