import { useState, useEffect, useRef } from 'react';
import { RiCameraLine, RiArrowRightLine } from 'react-icons/ri';
import Webcam from 'react-webcam';

const GhungrooDetectionUI = () => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Side: Webcam */}
      <div className="lg:col-span-2">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: "user",
            }}
            className="w-full h-full object-cover rounded-lg"
          />
          {showSuccess ? (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <div className="bg-white rounded-lg p-4 shadow-lg animate-bounce">
                <h3 className="text-green-600 font-bold text-xl">Success!</h3>
                <p className="text-gray-600">Great rhythm and timing!</p>
              </div>
            </div>
          ) : (sliderValue === "2" && !hasFailedOnce && detectionPercentage >= 50 && detectionPercentage < 52) ? (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="text-red-600 font-bold text-xl">Keep Practicing</h3>
                <p className="text-gray-600">Try to maintain the rhythm</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Side: Controls and Feedback */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tattadavu Practice</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form: {sliderValue === "1" ? "1" : "2"}
                </label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-orange-200 rounded-full appearance-none cursor-pointer"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Detection Progress</h3>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-orange-200">
                    <div
                      style={{ width: `${detectionPercentage}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500 transition-all duration-500"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold inline-block text-orange-600">
                      {detectionPercentage}%
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleStartTest}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                {testStarted ? "Restart Test" : "Start Test"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DancePractice() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [showGhungroo, setShowGhungroo] = useState(false);
  const tutorialVideoRef = useRef(null);

  const danceVideos = [
    {
      id: 1,
      title: "Tattadavu",
      src: "/1.mp4",
      description: "Basic stepping movements in Bharatanatyam"
    },
    {
      id: 2,
      title: "Nattadavu",
      src: "/2.mp4",
      description: "Fundamental stretching and stamping movements"
    },
    {
      id: 3,
      title: "Muditthadavu",
      src: "/3.mp4",
      description: "Complex footwork combinations"
    }
  ];

  const handleNextVideo = () => {
    if (currentVideoIndex < danceVideos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    } else {
      setShowCamera(true);
      setShowGhungroo(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-orange-900">Dance Practice</h1>
            <p className="text-orange-700">Master the fundamental steps of Bharatanatyam</p>
          </div>
        </div>

        {!showGhungroo ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Video Feed */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={tutorialVideoRef}
                  src={danceVideos[currentVideoIndex].src}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Current Dance Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {danceVideos[currentVideoIndex].title}
                </h2>
                <p className="text-gray-600 mb-6">{danceVideos[currentVideoIndex].description}</p>
                <button
                  onClick={handleNextVideo}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {currentVideoIndex === danceVideos.length - 1 ? 'Start Practice' : 'Next Video'}
                  <RiArrowRightLine className="w-5 h-5" />
                </button>
              </div>

              {/* Progress */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress</h2>
                <div className="flex items-center gap-2">
                  {danceVideos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === currentVideoIndex ? 'bg-orange-500' :
                        index < currentVideoIndex ? 'bg-green-500' :
                        'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <GhungrooDetectionUI />
        )}
      </div>
    </div>
  );
} 