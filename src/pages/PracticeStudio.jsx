import { useState, useEffect, useRef } from 'react';
import { RiVideoLine, RiTimeLine, RiVolumeUpLine, RiFullscreenLine, RiCameraLine } from 'react-icons/ri';
import { GiMusicalNotes, GiPeaceDove } from 'react-icons/gi';

export default function PracticeStudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentPose, setCurrentPose] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [showGuide, setShowGuide] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const currentLesson = {
    name: "Bharatanatyam Basics",
    level: "Beginner",
    duration: "45 mins",
    guru: "Guru Lakshmi",
    description: "Learn the fundamental poses and hand gestures of Bharatanatyam",
    currentStep: 2,
    totalSteps: 8
  };

  const poseGuide = {
    name: "Samapada",
    description: "The basic standing position in Bharatanatyam",
    keyPoints: [
      "Feet together, parallel to each other",
      "Knees slightly bent",
      "Back straight, shoulders relaxed",
      "Arms by your sides, palms facing thighs"
    ]
  };

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

  // Mock function to simulate AI feedback
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        const newFeedback = {
          timestamp: new Date().toLocaleTimeString(),
          message: "Great posture! Try to keep your back straighter.",
          type: "improvement" // or "success" or "correction"
        };
        setFeedback(prev => [newFeedback, ...prev].slice(0, 5));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">{currentLesson.name}</h1>
          <p className="text-orange-700">with {currentLesson.guru}</p>
        </div>
        <div className="flex gap-4">
          <button 
            className={`btn ${isRecording ? 'btn-error' : 'bg-orange-600 hover:bg-orange-700'} text-white border-none`}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? 'Stop Practice' : 'Start Practice'}
          </button>
        </div>
      </div>

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

            {/* Progress Indicator */}
            <div className="absolute top-4 left-4 right-4">
              <div className="flex justify-between text-white text-sm mb-2">
                <span>Step {currentLesson.currentStep} of {currentLesson.totalSteps}</span>
                <span>{currentLesson.duration} remaining</span>
              </div>
              <div className="w-full h-1 bg-white/30 rounded-full">
                <div 
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(currentLesson.currentStep / currentLesson.totalSteps) * 100}%` }}
                />
              </div>
            </div>
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
          {/* Current Pose Guide */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-orange-900 flex items-center gap-2">
                <GiMusicalNotes className="text-orange-600" />
                Current Pose: {poseGuide.name}
              </h2>
              <p className="text-orange-700">{poseGuide.description}</p>
              <div className="mt-4">
                <h3 className="font-medium text-orange-900 mb-2">Key Points:</h3>
                <ul className="space-y-2">
                  {poseGuide.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-center gap-2 text-orange-700">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Rhythm Tracker */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-orange-900 flex items-center gap-2">
                <RiTimeLine className="text-orange-600" />
                Tala Tracker
              </h2>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[1, 2, 3, 4].map((beat) => (
                  <div 
                    key={beat}
                    className={`aspect-square rounded-lg ${
                      beat === 1 ? 'bg-orange-500' : 'bg-orange-100'
                    } flex items-center justify-center text-lg font-bold ${
                      beat === 1 ? 'text-white' : 'text-orange-600'
                    }`}
                  >
                    {beat}
                  </div>
                ))}
              </div>
              <p className="text-sm text-orange-700 mt-4">
                Current Tala: Adi Talam (8 beats)
              </p>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-orange-900">Performance Stats</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-orange-900">Pose Accuracy</span>
                    <span className="text-orange-600">85%</span>
                  </div>
                  <div className="w-full h-2 bg-orange-100 rounded-full">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-orange-900">Rhythm Sync</span>
                    <span className="text-orange-600">92%</span>
                  </div>
                  <div className="w-full h-2 bg-orange-100 rounded-full">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-orange-900">Expression Score</span>
                    <span className="text-orange-600">78%</span>
                  </div>
                  <div className="w-full h-2 bg-orange-100 rounded-full">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 