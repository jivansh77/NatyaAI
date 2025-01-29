import { useState, useEffect, useRef } from 'react';
import { RiCameraLine, RiArrowRightLine } from 'react-icons/ri';

export default function DancePractice() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const tutorialVideoRef = useRef(null);

  const danceVideos = [
    {
      id: 1,
      title: "Thatta Adavu",
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
    }
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
    // Cleanup camera on component unmount
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
          message: "Good form! Keep your movements precise and rhythmic.",
          type: "improvement"
        };
        setFeedback(prev => [newFeedback, ...prev].slice(0, 5));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-orange-900">Dance Practice</h1>
            <p className="text-orange-700">Master the fundamental steps of Bharatanatyam</p>
          </div>
          {showCamera && (
            <button 
              className={`px-6 py-2 rounded-lg ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} text-white transition-colors`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? 'Stop Practice' : 'Start Practice'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video/Camera Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {!showCamera ? (
                <video
                  ref={tutorialVideoRef}
                  src={danceVideos[currentVideoIndex].src}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : isCameraOn ? (
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
                    {showCamera && (
                      <button 
                        className="text-white hover:text-orange-400"
                        onClick={toggleCamera}
                      >
                        <RiCameraLine className={`w-6 h-6 ${!isCameraOn && 'opacity-50'}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Feedback */}
            {showCamera && (
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
                      <span className="text-sm font-medium">{item.message}</span>
                      <span className="text-xs opacity-70 ml-auto">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Current Dance Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {showCamera ? "Practice Mode" : danceVideos[currentVideoIndex].title}
              </h2>
              {!showCamera && (
                <>
                  <p className="text-gray-600 mb-6">{danceVideos[currentVideoIndex].description}</p>
                  <button
                    onClick={handleNextVideo}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {currentVideoIndex === danceVideos.length - 1 ? 'Start Practice' : 'Next Video'}
                    <RiArrowRightLine className="w-5 h-5" />
                  </button>
                </>
              )}
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
                {showCamera && (
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 