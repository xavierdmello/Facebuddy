'use client';

import * as faceapi from 'face-api.js';

import { useEffect, useRef, useState } from 'react';

interface SavedFace {
  label: string;
  descriptor: Float32Array;
}

interface DetectedFace {
  detection: faceapi.FaceDetection;
  descriptor: Float32Array;
  isSelected?: boolean;
  label: string;
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
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);

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
      setSelectedFaceIndex(null);
      setDetectedFaces([]);
      setPersonName('');
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

    setDetectedFaces(resizedDetections.map(({ detection, descriptor }, index) => ({
      detection,
      descriptor,
      label: `Face ${index + 1}`
    })));
  };

  const drawFaces = () => {
    if (!canvasRef.current || !detectedFaces.length) return;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      detectedFaces.forEach(({ detection, label }, index) => {
        const isSelected = index === selectedFaceIndex;
        const drawBox = new faceapi.draw.DrawBox(detection.box, { 
          label: label,
          boxColor: isSelected ? '#00ff00' : '#ffd700'
        });
        drawBox.draw(canvasRef.current!);
      });
    }
  };

  useEffect(() => {
    drawFaces();
  }, [detectedFaces, selectedFaceIndex]);

  const saveFace = async () => {
    if (!imageRef.current || !isModelLoaded || !personName || selectedFaceIndex === null) {
      alert('Please enter a name and select a face');
      return;
    }

    const selectedFace = detectedFaces[selectedFaceIndex];
    if (!selectedFace) return;

    const updatedFaces = detectedFaces.map((face, index) => 
      index === selectedFaceIndex 
        ? { ...face, label: personName }
        : face
    );
    setDetectedFaces(updatedFaces);

    const savedFace: SavedFace = {
      label: personName,
      descriptor: selectedFace.descriptor
    };

    onFaceSaved([savedFace]);
    alert(`Saved face for ${personName}!`);
    setPersonName('');
    setSelectedFaceIndex(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Register New Face</h2>
      
      <div className="flex w-full max-w-[450px] gap-4">
        {/* Left side: Image upload and preview */}
        <div className="flex-1">
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

        {/* Right side: Face selection and labeling */}
        {detectedFaces.length > 0 && (
          <div className="flex flex-col gap-4 min-w-[200px]">
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="text-sm font-semibold mb-2">Select Face to Label</h3>
              <div className="flex flex-col gap-2">
                {detectedFaces.map((face, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedFaceIndex(index)}
                    className={`px-3 py-2 rounded text-left ${
                      selectedFaceIndex === index
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {face.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedFaceIndex !== null && (
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="text-sm font-semibold mb-2">Label Selected Face</h3>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="Enter person's name"
                    className="px-2 py-1 border rounded"
                  />
                  <button
                    onClick={saveFace}
                    disabled={!personName}
                    className={`px-4 py-2 rounded ${
                      !personName
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                  >
                    Save Face
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {detectedFaces.length > 0 && (
        <p className="text-sm text-gray-600">
          {selectedFaceIndex !== null 
            ? `${detectedFaces[selectedFaceIndex].label} selected for labeling`
            : 'Select a face from the list to label it'}
        </p>
      )}
    </div>
  );
} 