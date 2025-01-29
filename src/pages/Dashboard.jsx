import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { 
  RiVideoLine, 
  RiTimeLine, 
  RiMedalLine, 
  RiHeartLine,
  RiBookLine,
  RiGroupLine,
  RiRoadMapLine,
  RiLightbulbLine,
  RiCheckLine,
  RiArrowRightLine
} from 'react-icons/ri';
import { GiLotus, GiPeaceDove, GiMusicalNotes } from 'react-icons/gi';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const RoadmapNode = ({ node, isSelected, onClick }) => {
  // Calculate the projected date
  const getProjectedDate = (timeRequired) => {
    const days = parseInt(timeRequired);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-4 rounded-lg cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-orange-100 border-2 border-orange-500' 
          : node.isCompleted 
            ? 'bg-green-50 border-2 border-green-500' 
            : 'bg-gray-50 border-2 border-gray-300'
      }`}
      onClick={() => onClick(node)}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          node.isCompleted 
            ? 'bg-green-500 text-white' 
            : isSelected 
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-600'
        }`}>
          {node.isCompleted ? (
            <RiCheckLine className="w-6 h-6" />
          ) : (
            <span className="font-semibold">{node.id.replace('node', '')}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={`font-semibold ${
              node.isCompleted 
                ? 'text-green-700' 
                : isSelected 
                  ? 'text-orange-700'
                  : 'text-gray-700'
            }`}>
              {node.title}
            </h3>
            {!node.isCompleted && (
              <div className="text-right">
                <span className="text-xs text-orange-600 font-medium block">
                  {getProjectedDate(node.timeRequired)}
                </span>
                <span className="text-xs text-gray-500">
                  {node.projectedStats ? `+${node.projectedStats.mudras} mudras, +${node.projectedStats.dances} dances` : ''}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">{node.description.split('.')[0]}</p>
          {node.currentProgress && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${node.currentProgress}%` }}
                />
              </div>
              <span className="text-xs text-orange-600">{node.currentProgress}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const RoadmapPath = () => (
  <div className="flex items-center justify-center py-2">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"
    >
      <RiArrowRightLine className="w-5 h-5 text-orange-500 rotate-90" />
    </motion.div>
  </div>
);

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
    }
  ]);

  const [guruScore, setGuruScore] = useState({
    id: 3,
    name: 'Guru Score',
    current: 0,
    target: 1000,
    unit: '',
    progress: 0,
    trend: '+0',
    timeLeft: '8 days'
  });

  const [roadmapData, setRoadmapData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuruScore = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().achievements) {
          const achievements = userDoc.data().achievements;
          const totalPoints = achievements.reduce((total, achievement) => total + (achievement.points || 0), 0);
          
          // Calculate progress percentage
          const progress = Math.min(Math.round((totalPoints / 1000) * 100), 100);
          
          // Calculate trend (sum of points from achievements in the last 7 days)
          const lastWeekAchievements = achievements.filter(a => {
            const achievementDate = new Date(a.earnedAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return achievementDate > weekAgo;
          });
          const recentPoints = lastWeekAchievements.reduce((total, achievement) => total + (achievement.points || 0), 0);

          setGuruScore(prev => ({
            ...prev,
            current: totalPoints,
            progress: progress,
            trend: `+${recentPoints}`
          }));
        }
      } catch (error) {
        console.error('Error fetching guru score:', error);
      }
    };

    fetchGuruScore();
  }, [user]);

  useEffect(() => {
    const fetchRoadmapData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const achievements = userDoc.data().achievements || [];
          
          // Get completed categories
          const completedMudras = achievements.filter(a => a.category === 'mudras').length;
          const completedDances = achievements.filter(a => a.category === 'performances').length;
          const completedPoses = achievements.filter(a => a.category === 'poses').length;

          // Generate roadmap using Gemini API
          const response = await fetch('http://localhost:5005/generate-roadmap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              completedMudras,
              completedDances,
              completedPoses,
              totalScore: guruScore.current
            })
          });

          const data = await response.json();
          setRoadmapData(data.roadmap);
        }
      } catch (error) {
        console.error('Error fetching roadmap data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmapData();
  }, [user, guruScore.current]);

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

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

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
        {[...learningStats, guruScore].map((stat) => (
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

      {/* Interactive Roadmap */}
      <div className="card bg-white shadow-lg">
        <div className="card-body">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <RiRoadMapLine className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-orange-900">Your Dance Journey Roadmap</h2>
            </div>
            {selectedNode && (
              <button 
                onClick={() => setSelectedNode(null)}
                className="btn btn-sm btn-ghost text-orange-600"
              >
                Close Details
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 2D Roadmap Visualization */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
                </div>
              ) : (
                <div className="space-y-2">
                  {roadmapData?.nodes.map((node, index) => (
                    <React.Fragment key={node.id}>
                      <RoadmapNode
                        node={node}
                        isSelected={selectedNode?.id === node.id}
                        onClick={handleNodeClick}
                      />
                      {index < roadmapData.nodes.length - 1 && <RoadmapPath />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Roadmap Details */}
            <div className="space-y-4">
              {selectedNode ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-orange-50 p-4 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">
                    {selectedNode.title}
                  </h3>
                  <div className="space-y-3">
                    <p className="text-orange-700">{selectedNode.description}</p>
                    
                    {!selectedNode.isCompleted && (
                      <>
                        <div className="flex items-center gap-2 bg-orange-100 p-2 rounded">
                          <RiTimeLine className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="text-sm font-medium text-orange-800">Target Completion:</p>
                            <p className="text-xs text-orange-700">
                              {getProjectedDate(selectedNode.timeRequired)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-orange-100 p-2 rounded space-y-2">
                          <div className="flex items-center gap-2">
                            <RiMedalLine className="w-5 h-5 text-orange-600" />
                            <p className="text-sm font-medium text-orange-800">Projected Achievements:</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white p-2 rounded">
                              <p className="text-xs text-orange-800">New Mudras</p>
                              <p className="text-lg font-semibold text-orange-600">+{selectedNode.projectedStats?.mudras || 0}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <p className="text-xs text-orange-800">New Dances</p>
                              <p className="text-lg font-semibold text-orange-600">+{selectedNode.projectedStats?.dances || 0}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <p className="text-xs text-orange-800">New Poses</p>
                              <p className="text-lg font-semibold text-orange-600">+{selectedNode.projectedStats?.poses || 0}</p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <p className="text-xs text-orange-800">Guru Score</p>
                              <p className="text-lg font-semibold text-orange-600">+{selectedNode.projectedStats?.score || 0}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      <RiLightbulbLine className="w-5 h-5 text-orange-600" />
                      <p className="text-sm text-orange-800">Recommended next steps:</p>
                    </div>
                    <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                      {selectedNode.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                    {selectedNode.isCompleted ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <RiMedalLine className="w-5 h-5" />
                        <span className="text-sm font-medium">Completed!</span>
                      </div>
                    ) : (
                      <>
                        {selectedNode.currentProgress && (
                          <div className="space-y-1">
                            <p className="text-xs text-orange-800">Current Progress</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-orange-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                                  style={{ width: `${selectedNode.currentProgress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-orange-600">
                                {selectedNode.currentProgress}%
                              </span>
                            </div>
                          </div>
                        )}
                        <Link 
                          to={selectedNode.practiceLink} 
                          className="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white border-none w-full mt-2"
                        >
                          Practice Now
                        </Link>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-orange-700 py-8">
                  <RiRoadMapLine className="w-12 h-12 mx-auto text-orange-400 mb-2" />
                  <p>Click on any milestone to see details and recommendations</p>
                </div>
              )}
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