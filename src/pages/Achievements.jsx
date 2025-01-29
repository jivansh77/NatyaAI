import { useState, useEffect } from 'react';
import { RiMedalLine, RiTrophyLine, RiStarLine, RiFireLine } from 'react-icons/ri';
import { GiLotus, GiPeaceDove, GiMusicalNotes, GiFootprint } from 'react-icons/gi';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Achievements() {
  const [user] = useAuthState(auth);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userAchievements, setUserAchievements] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().achievements) {
          const achievements = userDoc.data().achievements;
          setUserAchievements(achievements);
          
          // Calculate total points
          const points = achievements.reduce((total, achievement) => total + (achievement.points || 0), 0);
          setTotalPoints(points);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      }
    };

    fetchAchievements();
  }, [user]);

  const categories = [
    { id: 'all', name: 'All Achievements', icon: RiTrophyLine },
    { id: 'mudras', name: 'Mudras', icon: GiPeaceDove },
    { id: 'poses', name: 'Dance Poses', icon: GiLotus },
    { id: 'performances', name: 'Performances', icon: GiMusicalNotes },
  ];

  const milestones = [
    {
      level: 1,
      name: "First Steps",
      requirements: "Complete basic posture training",
      reward: "Basic Dancer Badge",
      completed: true
    },
    {
      level: 2,
      name: "Rhythm Explorer",
      requirements: "Master 3 different talas",
      reward: "Rhythm Badge + 100 Guru Points",
      completed: true
    },
    {
      level: 3,
      name: "Mudra Initiate",
      requirements: "Learn 15 basic mudras",
      reward: "Mudra Badge + 200 Guru Points",
      completed: userAchievements.some(a => a.name === "Mudra Master")
    }
  ];

  const filteredAchievements = userAchievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  // Get recent achievements (last 3)
  const recentAchievements = [...userAchievements]
    .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
    .slice(0, 3)
    .map(achievement => ({
      name: achievement.name,
      date: new Date(achievement.earnedAt).toLocaleDateString(),
      points: achievement.points
    }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">Achievements</h1>
          <p className="text-orange-700 mt-1">Track your progress and celebrate milestones</p>
        </div>
        <div className="stats bg-white shadow">
          <div className="stat">
            <div className="stat-title text-orange-700">Total Score</div>
            <div className="stat-value text-orange-900">{totalPoints}</div>
            <div className="stat-desc text-orange-600">Keep practicing to earn more!</div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`btn btn-lg gap-2 ${
              selectedCategory === category.id
                ? 'bg-orange-100 text-orange-900 border-orange-200'
                : 'bg-white text-orange-800 border-orange-100 hover:bg-orange-50'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <category.icon className="w-5 h-5" />
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAchievements.map((achievement, index) => (
              <div 
                key={index} 
                className="card bg-white shadow-lg"
              >
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-orange-100">
                      <GiPeaceDove className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-orange-900">{achievement.name}</h3>
                      <p className="text-sm text-orange-700">{achievement.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-orange-600">
                    Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <RiMedalLine className="w-5 h-5 text-orange-500" />
                    <span className="text-orange-600 font-medium">+{achievement.points} points</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Achievements */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-orange-900">Recent Achievements</h2>
              <div className="space-y-4 mt-4">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <RiStarLine className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-900">{achievement.name}</h4>
                      <p className="text-sm text-orange-700">{achievement.date}</p>
                    </div>
                    <div className="text-sm font-medium text-orange-600">
                      +{achievement.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Path */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-orange-900">Dance Journey</h2>
              <div className="space-y-6 mt-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative">
                    <div className={`w-8 h-8 rounded-full ${
                      milestone.completed ? 'bg-orange-500' : 'bg-orange-100'
                    } flex items-center justify-center text-sm font-bold ${
                      milestone.completed ? 'text-white' : 'text-orange-600'
                    }`}>
                      {milestone.level}
                    </div>
                    <div className="ml-12 -mt-8">
                      <h3 className="font-medium text-orange-900">{milestone.name}</h3>
                      <p className="text-sm text-orange-700 mt-1">{milestone.requirements}</p>
                      <div className="text-sm text-orange-600 mt-1">
                        Reward: {milestone.reward}
                      </div>
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="absolute left-3.5 top-8 bottom-0 w-0.5 h-12 bg-orange-100" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Streak */}
          <div className="card bg-gradient-to-r from-orange-100 to-pink-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <RiFireLine className="w-8 h-8 text-orange-600" />
                <div>
                  <h3 className="font-medium text-orange-900">Current Streak</h3>
                  <div className="text-3xl font-bold text-orange-700">7 Days</div>
                </div>
              </div>
              <p className="text-sm text-orange-700 mt-2">
                Keep practicing daily to maintain your streak!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 