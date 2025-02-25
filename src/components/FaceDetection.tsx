'use client';

import * as faceapi from 'face-api.js';

import { useEffect, useRef, useState } from 'react';

export default function FaceDetection() {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
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

    if (!fullFaceDescriptions.length) {
      console.log('No faces detected');
      return;
    }

    if (!faceMatcher) {
      const labeledDescriptors = fullFaceDescriptions.map((fd, i) => {
        return new faceapi.LabeledFaceDescriptors(
          personName || `Person ${i + 1}`,
          [fd.descriptor]
        );
      });
      setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors));
    }

    const resizedDetections = faceapi.resizeResults(fullFaceDescriptions, displaySize);

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      resizedDetections.forEach(({ detection, descriptor }) => {
        let label = 'Unknown';
        if (faceMatcher) {
          const match = faceMatcher.findBestMatch(descriptor);
          label = `${match.label} (${Math.round(100 - match.distance * 100)}%)`;
        }

        const drawBox = new faceapi.draw.DrawBox(detection.box, { 
          label,
          boxColor: '#00ff00',
          drawLabelOptions: {
            fontSize: 20,
            fontStyle: 'bold'
          }
        });
        drawBox.draw(canvasRef.current!);
      });
    }
  };

  const saveAsReference = async () => {
    if (!imageRef.current || !isModelLoaded) return;

    const fullFaceDescriptions = await faceapi
      .detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!fullFaceDescriptions.length) {
      alert('No faces detected to save!');
      return;
    }

    const labeledDescriptors = fullFaceDescriptions.map(fd => {
      return new faceapi.LabeledFaceDescriptors(
        personName || 'Unknown Person',
        [fd.descriptor]
      );
    });

    setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors));
    alert('Reference face saved!');
  };

  return (
    <div className="flex flex-col items-center gap-4">
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
          onClick={saveAsReference}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save as Reference
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