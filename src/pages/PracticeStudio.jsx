import { useState, useEffect, useRef } from 'react';
import { RiVideoLine, RiTimeLine, RiVolumeUpLine, RiFullscreenLine, RiCameraLine, RiUserStarLine, RiBodyScanLine } from 'react-icons/ri';
import { GiMusicalNotes, GiPeaceDove, GiPrayerBeads } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';

export default function PracticeStudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentPose, setCurrentPose] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [showGuide, setShowGuide] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

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

  const practiceCategories = [
    {
      id: 'mudra',
      title: 'Mudra Practice',
      description: 'Learn and practice the traditional hand gestures of Bharatanatyam',
      icon: GiPrayerBeads,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'dance',
      title: 'Dance Practice',
      description: 'Practice full dance sequences and choreographies',
      icon: RiUserStarLine,
      color: 'from-rose-500 to-rose-600'
    },
    {
      id: 'pose',
      title: 'Pose Practice',
      description: 'Master the fundamental poses and stances',
      icon: RiBodyScanLine,
      color: 'from-purple-500 to-purple-600'
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

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'mudra') {
      navigate('/practice/mudra');
    } else if (categoryId === 'dance') {
      navigate('/practice/dance');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-900 mb-2">Practice Studio</h1>
        <p className="text-orange-700 mb-8">Choose a practice category to begin your session</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="p-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-4`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 