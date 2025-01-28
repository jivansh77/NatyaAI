import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiVideoLine, 
  RiTimeLine, 
  RiMedalLine, 
  RiHeartLine,
  RiBookLine,
  RiGroupLine
} from 'react-icons/ri';
import { GiLotus, GiPeaceDove, GiMusicalNotes } from 'react-icons/gi';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [learningStats, setLearningStats] = useState([
    { 
      id: 1,
      name: 'Practice Hours',
      current: 24,
      target: 50,
      unit: 'hrs',
      progress: 48,
      trend: '+2.5 hrs',
      timeLeft: '8 days'
    },
    {
      id: 2,
      name: 'Mudras Mastered',
      current: 15,
      target: 28,
      unit: '',
      progress: 53,
      trend: '+3',
      timeLeft: '8 days'
    },
    {
      id: 3,
      name: 'Guru Score',
      current: 750,
      target: 1000,
      unit: '',
      progress: 75,
      trend: '+25',
      timeLeft: '8 days'
    }
  ]);

  const upcomingSessions = [
    {
      id: 1,
      name: 'Bharatanatyam Basics',
      time: '10:00 AM',
      duration: '45 mins',
      difficulty: 'Beginner',
      guru: 'Guru Lakshmi'
    },
    {
      id: 2,
      name: 'Mudra Practice',
      time: '2:30 PM',
      duration: '30 mins',
      difficulty: 'Intermediate',
      guru: 'Guru Rajesh'
    },
    {
      id: 3,
      name: 'Abhinaya Workshop',
      time: '5:00 PM',
      duration: '60 mins',
      difficulty: 'Advanced',
      guru: 'Guru Meenakshi'
    }
  ];

  const culturalInsights = [
    {
      title: "The Story of Nataraja",
      description: "Learn about Lord Shiva's cosmic dance and its significance in Indian classical dance.",
      category: "Mythology",
      readTime: "5 min"
    },
    {
      title: "Understanding Mudras",
      description: "Explore the language of hand gestures in Indian classical dance.",
      category: "Technique",
      readTime: "7 min"
    },
    {
      title: "Rasa Theory",
      description: "Discover the nine emotions that form the foundation of Indian classical dance.",
      category: "Theory",
      readTime: "10 min"
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">Namaste, {user?.displayName || 'Dancer'}!</h1>
          <p className="text-orange-700 mt-1">Continue your journey in Indian classical dance</p>
        </div>
        <Link to="/practice-studio" className="btn bg-orange-600 hover:bg-orange-700 text-white border-none">
          Start Practice
        </Link>
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {learningStats.map((stat) => (
          <div key={stat.id} className="card bg-white shadow-lg">
            <div className="card-body">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-orange-900">{stat.name}</h3>
                <span className="text-green-600 text-sm">{stat.trend}</span>
              </div>
              
              <div className="flex justify-between text-sm mb-2">
                <span className="text-orange-800">Current: {stat.unit}{stat.current}</span>
                <span className="text-orange-800">Target: {stat.unit}{stat.target}</span>
                </div>

              <div className="w-full h-3 bg-orange-100 rounded-full mb-2">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${stat.progress}%` }}
                >
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-orange-600">{stat.progress}% Complete</span>
                <span className="text-orange-600">{stat.timeLeft} remaining</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white shadow-lg">
        <div className="card-body">
            <h2 className="card-title text-orange-900 flex items-center gap-2">
              <RiTimeLine className="text-orange-600" />
              Today's Practice Sessions
            </h2>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <GiMusicalNotes className="w-6 h-6 text-orange-600" />
          </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-orange-900">{session.name}</h3>
                    <div className="flex gap-4 text-sm text-orange-700">
                      <span>{session.time}</span>
                      <span>{session.duration}</span>
                      <span>{session.difficulty}</span>
                  </div>
                  </div>
                  <button className="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white border-none">
                    Join
                  </button>
                </div>
              ))}
            </div>
                    </div>
                  </div>

        {/* Cultural Insights */}
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-orange-900 flex items-center gap-2">
              <RiBookLine className="text-orange-600" />
              Cultural Insights
            </h2>
            <div className="space-y-4">
              {culturalInsights.map((insight, index) => (
                <div key={index} className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-orange-900">{insight.title}</h3>
                    <span className="badge bg-orange-100 text-orange-700 border-none">
                      {insight.category}
                    </span>
                  </div>
                  <p className="text-sm text-orange-700 mt-2">{insight.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-orange-600">{insight.readTime} read</span>
                    <button className="btn btn-sm btn-ghost text-orange-600 hover:bg-orange-100">
                      Read More
                    </button>
                  </div>
                </div>
              ))}
              </div>
          </div>
        </div>
      </div>

      {/* Community Highlights */}
      <div className="card bg-white shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-orange-900 flex items-center gap-2">
            <RiGroupLine className="text-orange-600" />
            NatyaSangam Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <GiPeaceDove className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-orange-900">Weekly Challenge</h3>
              </div>
              <p className="text-sm text-orange-700">Master the 'Anjali Mudra' and share your progress!</p>
              <button className="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white border-none mt-3 w-full">
                Join Challenge
              </button>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RiMedalLine className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-orange-900">Leaderboard</h3>
              </div>
              <p className="text-sm text-orange-700">You're in the top 10% of dedicated learners!</p>
              <button className="btn btn-sm btn-ghost text-orange-600 hover:bg-orange-100 mt-3 w-full">
                View Rankings
              </button>
                </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RiHeartLine className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-orange-900">Community</h3>
              </div>
              <p className="text-sm text-orange-700">Connect with 1000+ fellow dancers worldwide!</p>
              <button className="btn btn-sm btn-ghost text-orange-600 hover:bg-orange-100 mt-3 w-full">
                Join Discussion
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 