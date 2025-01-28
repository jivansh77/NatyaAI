import { useState } from 'react';
import { RiMedalLine, RiTrophyLine, RiStarLine, RiFireLine } from 'react-icons/ri';
import { GiLotus, GiPeaceDove, GiMusicalNotes, GiFootprint } from 'react-icons/gi';

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Achievements', icon: RiTrophyLine },
    { id: 'mudras', name: 'Mudras', icon: GiPeaceDove },
    { id: 'poses', name: 'Dance Poses', icon: GiLotus },
    { id: 'performances', name: 'Performances', icon: GiMusicalNotes },
  ];

  const achievements = [
    {
      id: 1,
      name: "Mudra Master",
      description: "Mastered 25 basic hand gestures",
      category: "mudras",
      progress: 80,
      current: 20,
      target: 25,
      icon: GiPeaceDove,
      rarity: "rare",
      unlockedAt: "2024-02-15"
    },
    {
      id: 2,
      name: "Rhythm Virtuoso",
      description: "Maintained perfect rhythm for 10 consecutive sequences",
      category: "performances",
      progress: 100,
      current: 10,
      target: 10,
      icon: GiMusicalNotes,
      rarity: "epic",
      unlockedAt: "2024-02-10"
    },
    {
      id: 3,
      name: "Pose Perfect",
      description: "Achieved 95% accuracy in basic poses",
      category: "poses",
      progress: 60,
      current: 57,
      target: 95,
      icon: GiLotus,
      rarity: "common",
      unlockedAt: null
    }
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
      completed: false
    }
  ];

  const recentAchievements = [
    {
      name: "Perfect Aramandi",
      date: "2 days ago",
      points: 50
    },
    {
      name: "5-Day Streak",
      date: "1 week ago",
      points: 100
    },
    {
      name: "First Performance",
      date: "2 weeks ago",
      points: 200
    }
  ];

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

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
            <div className="stat-value text-orange-900">2,450</div>
            <div className="stat-desc text-orange-600">↗︎ 350 points this month</div>
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
            {filteredAchievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`card bg-white shadow-lg ${
                  achievement.progress === 100 ? 'border-2 border-orange-300' : ''
                }`}
              >
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      achievement.rarity === 'epic' ? 'bg-gradient-to-br from-orange-100 to-pink-100' :
                      achievement.rarity === 'rare' ? 'bg-orange-100' :
                      'bg-gray-100'
                    }`}>
                      <achievement.icon className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-orange-900">{achievement.name}</h3>
                      <p className="text-sm text-orange-700">{achievement.description}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-orange-900">Progress</span>
                      <span className="text-orange-600">{achievement.current}/{achievement.target}</span>
                    </div>
                    <div className="w-full h-2 bg-orange-100 rounded-full">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>

                  {achievement.unlockedAt && (
                    <div className="mt-4 text-sm text-orange-600">
                      Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
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