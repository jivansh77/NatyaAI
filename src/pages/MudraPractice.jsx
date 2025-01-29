import { useState, useEffect, useRef, Suspense } from 'react';
import { RiCameraLine, RiVolumeUpLine, RiFullscreenLine, RiArrowRightLine, RiSkipForwardLine } from 'react-icons/ri';
import { GiPeaceDove } from 'react-icons/gi';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

function Model({ url }) {
  const { scene } = useGLTF(url);
  
  // Apply material modifications to make the model more visible
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set('#e6b17e'); // Skin tone color
      child.material.metalness = 0.1;
      child.material.roughness = 0.7;
    }
  });

  return <primitive object={scene} scale={1.28} position={[0, 0, 0]} />;
}

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

export default function MudraPractice() {
  const [user] = useAuthState(auth);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [currentMudra, setCurrentMudra] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const mudras = [
    {
      name: "pataka",
      modelUrl: "/pataka.glb",
      description: "The flag hand gesture - palm stretched flat with all fingers extended",
      keyPoints: [
        "Keep all fingers together",
        "Stretch the palm flat",
        "Keep fingers straight",
        "Maintain tension in the hand"
      ]
    },
    {
      name: "mushti",
      modelUrl: "/mushti.glb",
      description: "The fist mudra - a closed fist with thumb either tucked in or placed on fingers",
      keyPoints: [
        "Close all fingers into a tight fist",
        "Thumb can be tucked inside or placed over fingers",
        "Keep the wrist straight",
        "Maintain a firm grip"
      ]
    },
    {
      name: "sinhamukh",
      modelUrl: "/sinhamukh.glb",
      description: "The lion's face - all fingers extended like claws with thumb pointing towards palm",
      keyPoints: [
        "Extend and curve all fingers like claws",
        "Point thumb towards the palm",
        "Keep fingers spread apart",
        "Maintain curved tension in fingers"
      ]
    },
    {
      name: "trishool",
      modelUrl: "/trishool.glb",
      description: "The trident - middle and ring fingers folded, others extended",
      keyPoints: [
        "Extend index finger straight up",
        "Fold middle and ring fingers",
        "Extend little finger",
        "Keep thumb extended at an angle"
      ]
    }
  ];

  const toggleCamera = async () => {
    if (isCameraOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          streamRef.current.removeTrack(track);
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setIsCameraOn(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }
  };

  useEffect(() => {
    // Initialize camera
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setIsCameraOn(false);
      }
    };

    initCamera();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          streamRef.current?.removeTrack(track);
        });
        streamRef.current = null;
      }
    };
  }, []);

  // Get mudra detections from Python backend
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch('http://127.0.0.1:5000/get_detections', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          });
          const data = await response.json();
          
          if (data.detections && data.detections.length > 0) {
            const bestDetection = data.detections.sort((a, b) => b.confidence - a.confidence)[0];
            
            const newFeedback = {
              timestamp: new Date().toLocaleTimeString(),
              message: `Detected ${bestDetection.label} (${(bestDetection.confidence * 100).toFixed(1)}% confidence)`,
              type: bestDetection.confidence > 0.8 ? "success" : 
                    bestDetection.confidence > 0.6 ? "improvement" : "correction"
            };
            
            setFeedback(prev => [newFeedback, ...prev].slice(0, 5));
            setCurrentMudra(bestDetection.label);

            // Check if the detected mudra matches the current tutorial step
            if (bestDetection.label === mudras[currentStep].name && bestDetection.confidence > 0.6) {
              setIsCorrect(true);
              // Wait for 2 seconds before moving to the next mudra
              setTimeout(() => {
                if (currentStep < mudras.length - 1) {
                  setCurrentStep(prev => prev + 1);
                  setIsCorrect(false);
                }
              }, 2000);
            }
          }
        } catch (error) {
          console.error('Error getting detections:', error);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRecording, currentStep]);

  const handleSkip = () => {
    if (currentStep < mudras.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsCorrect(false);
    } else {
      handleCompletion();
    }
  };

  const handleCompletion = async () => {
    if (!user) return;

    try {
      // Show badge animation
      setShowBadge(true);

      // Save achievement to Firestore
      const achievementData = {
        name: "Mudra Master",
        description: "Completed all basic mudras practice",
        category: "mudras",
        earnedAt: new Date().toISOString(),
        points: 100
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-orange-900">Mudra Practice</h1>
            <p className="text-orange-700">Master the traditional hand gestures of Bharatanatyam</p>
          </div>
          <div className="flex gap-4">
            <button 
              className="px-6 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors"
              onClick={handleSkip}
            >
              <div className="flex items-center gap-2">
                <RiSkipForwardLine className="w-5 h-5" />
                Skip
              </div>
            </button>
            <button 
              className={`px-6 py-2 rounded-lg ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} text-white transition-colors`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? 'Stop Practice' : 'Start Practice'}
            </button>
          </div>
        </div>

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
              <p className="text-center text-white">Mudra Master</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <p className="text-white text-lg">Camera is turned off</p>
                </div>
              )}
              
              {/* Overlay Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <button 
                      className="text-white hover:text-orange-400"
                      onClick={toggleCamera}
                    >
                      <RiCameraLine className={`w-6 h-6 ${!isCameraOn && 'opacity-50'}`} />
                    </button>
                    <button className="text-white hover:text-orange-400">
                      <RiVolumeUpLine className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button className="text-white hover:text-orange-400">
                      <RiFullscreenLine className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Correct Gesture Overlay */}
              {isCorrect && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 shadow-lg animate-bounce">
                    <h3 className="text-green-600 font-bold text-xl">Correct!</h3>
                    <p className="text-gray-600">Moving to next mudra...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Feedback */}
            <div className="space-y-2">
              {feedback.map((item, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg ${
                    item.type === 'success' ? 'bg-green-100 text-green-800' :
                    item.type === 'correction' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GiPeaceDove className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.message}</span>
                    <span className="text-xs opacity-70 ml-auto">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* 3D Model Viewer */}
            <div className="bg-white rounded-lg shadow-lg p-6 aspect-square">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Mudra: {mudras[currentStep].name}
              </h2>
              <div className="w-full h-64 bg-gray-100 rounded-lg">
                <Canvas camera={{ position: [1, 1, 2], fov: 60 }}>
                  <color attach="background" args={['#f8fafc']} />
                  <ambientLight intensity={1.5} />
                  <directionalLight position={[5, 5, 5]} intensity={1.5} />
                  <directionalLight position={[-5, -5, -5]} intensity={0.5} />
                  <spotLight 
                    position={[0, 5, 0]} 
                    intensity={0.8}
                    angle={0.5}
                    penumbra={1}
                  />
                  <Suspense fallback={null}>
                    <Model url={mudras[currentStep].modelUrl} />
                  </Suspense>
                  <OrbitControls 
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    minDistance={1}
                    maxDistance={5}
                  />
                </Canvas>
              </div>
            </div>

            {/* Tutorial Instructions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
              <p className="text-gray-600 mb-4">{mudras[currentStep].description}</p>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Key Points:</h3>
                <ul className="space-y-2">
                  {mudras[currentStep].keyPoints.map((point, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress</h2>
              <div className="flex items-center gap-2">
                {mudras.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentStep ? 'bg-orange-500' :
                      index < currentStep ? 'bg-green-500' :
                      'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 