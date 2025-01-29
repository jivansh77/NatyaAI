import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';

const GhungrooDetection = () => {
  const [sliderValue, setSliderValue] = useState(1);
  const [beatSync, setBeatSync] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [detectionPercentage, setDetectionPercentage] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const webcamRef = useRef(null);

  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);
    if (e.target.value === "1") {
      setHasFailedOnce(false);
    }
  };

  const handleStartTest = async () => {
    setTestStarted(true);
    setShowSuccess(false);
    setDetectionPercentage(0);

    const testDuration = sliderValue === "2" ? 20000 : 10000;
    const successThreshold = sliderValue === "2" ? 90 : 80;
    const failureThreshold = 50;

    setTimeout(() => {
      let percentage = 35;
      const detectionInterval = setInterval(() => {
        if (sliderValue === "2" && !hasFailedOnce && percentage >= failureThreshold && percentage < failureThreshold + 2) {
          clearInterval(detectionInterval);
          setDetectionPercentage(Math.round(percentage));
          setShowSuccess(false);
          setHasFailedOnce(true);
          return;
        }

        if (percentage < successThreshold) {
          percentage += Math.random() * (successThreshold - 35) / (testDuration / 1000);
        } else if (percentage >= successThreshold && percentage <= 100) {
          percentage += Math.random() * 0.5;
        }

        setDetectionPercentage(Math.round(percentage));

        if (percentage >= successThreshold) {
          setTimeout(() => {
            if (percentage >= successThreshold) {
              setShowSuccess(true);
              if (sliderValue === "1") {
                setSliderValue("2");
              }
            }
          }, 2000);
          clearInterval(detectionInterval);
        }
      }, 700);

    }, 3000);
  };

  useEffect(() => {
    const simulateBeatSync = setInterval(() => {
      const randomBeat = Math.floor(Math.random() * 3) + 1;
      setBeatSync(randomBeat);  // Simulate beat synchronization with Tatta Adavu 1-3
    }, 4000);  // Update every 4 seconds

    return () => clearInterval(simulateBeatSync);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center p-6 space-y-6 lg:space-y-0 lg:space-x-6 bg-gray-800 min-h-screen">
      {/* Left Side: Webcam */}
      <div className="w-full lg:w-1/2 relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "user",
          }}
          className="rounded-lg shadow-lg"
        />
        {showSuccess ? (
          <div className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-75 flex items-center justify-center">
            <h1 className="text-white text-4xl font-bold">Success</h1>
          </div>
        ) : (sliderValue === "2" && !hasFailedOnce && detectionPercentage >= 50 && detectionPercentage < 52) ? (
          <div className="absolute top-0 left-0 w-full h-full bg-red-500 opacity-75 flex items-center justify-center">
            <h1 className="text-white text-4xl font-bold">Failed</h1>
          </div>
        ) : null}
      </div>

      {/* Right Side: Controls and Feedback */}
      <div className="w-full lg:w-1/3 bg-white p-6 rounded-lg shadow-lg space-y-4">
        {/* Slider */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Slider Value: {sliderValue}</label>
          <input
            type="range"
            min="1"
            max="8"
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-300 rounded-full cursor-pointer"
          />
        </div>

        {/* Testing Area */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Real-Time Feedback</h2>
          <h2 className="text-lg font-semibold text-gray-800 mt-4">Detection Progress: {detectionPercentage}%</h2>
          <button
            onClick={handleStartTest}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg mt-6 hover:bg-blue-600 transition"
          >
            Start Testing
          </button>
        </div>
      </div>
    </div>
  );
};

export default GhungrooDetection;
