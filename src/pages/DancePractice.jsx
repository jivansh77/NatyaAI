import { useState, useEffect, useRef, Suspense } from 'react';
import { RiCameraLine, RiArrowRightLine } from 'react-icons/ri';
import Webcam from 'react-webcam';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

function BadgeModel() {
  const { scene } = useGLTF('/badge.glb');
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.metalness = 0.8;
        child.material.roughness = 0.2;
      }
    });
  }, [scene]);

  return (
    <primitive 
      object={scene} 
      scale={2} 
      position={[0, 0, 0]} 
      rotation={[0, performance.now() * 0.001, 0]} 
    />
  );
}

const GhungrooDetectionUI = () => {
  const [user] = useAuthState(auth);
  const [sliderValue, setSliderValue] = useState(1);
  const [beatSync, setBeatSync] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [detectionPercentage, setDetectionPercentage] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const webcamRef = useRef(null);

  const handleCompletion = async () => {
    if (!user) return;

    try {
      // Show badge animation
      setShowBadge(true);

      // Save achievement to Firestore
      const achievementData = {
        name: "Dance Master",
        description: "Mastered the basic dance steps with perfect rhythm",
        category: "performances",
        earnedAt: new Date().toISOString(),
        points: 150
      };

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const achievements = userDoc.data().achievements || [];
        await setDoc(userRef, {
          achievements: [...achievements, achievementData]
        }, { merge: true });
      }

      // Hide badge after 3 seconds
      setTimeout(() => {
        setShowBadge(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving achievement:', error);
    }
  };

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
              if (sliderValue === "2") {
                handleCompletion();
              } else if (sliderValue === "1") {
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
      {/* Badge Overlay */}
      {showBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-64 h-64 bg-transparent rounded-lg">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 5, 5]} intensity={1.5} />
              <Suspense fallback={null}>
                <BadgeModel />
              </Suspense>
            </Canvas>
            <h2 className="text-center text-2xl font-bold text-white mt-4">
              Achievement Unlocked!
            </h2>
            <p className="text-center text-white">Dance Master</p>
          </div>
        </div>
      )}

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