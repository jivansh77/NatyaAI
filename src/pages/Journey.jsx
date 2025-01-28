import { useState } from 'react';
import { RiTimeLine, RiMedalLine, RiStarLine, RiBarChartLine, RiCalendarLine } from 'react-icons/ri';
import { GiLotus, GiPeaceDove, GiMusicalNotes } from 'react-icons/gi';

export default function Journey() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  const timeframes = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'year', name: 'This Year' },
    { id: 'all', name: 'All Time' }
  ];

  const practiceStats = {
    totalHours: 48,
    totalSessions: 96,
    averageAccuracy: 85,
    currentStreak: 7,
    bestStreak: 14
  };

  const progressHistory = [
    {
      date: '2024-03-15',
      hours: 2,
      accuracy: 88,
      highlights: ['Mastered Tripataka Mudra', 'Completed Adavus Set 1'],
      feedback: 'Excellent rhythm control in today\'s practice'
    },
    {
      date: '2024-03-14',
      hours: 1.5,
      accuracy: 82,
      highlights: ['Practiced Aramandi position'],
      feedback: 'Good progress on posture alignment'
    },
    {
      date: '2024-03-13',
      hours: 1,
      accuracy: 85,
      highlights: ['Started learning new Tala pattern'],
      feedback: 'Keep working on timing consistency'
    }
  ];

  const skillProgress = [
    {
      category: 'Mudras',
      skills: [
        { name: 'Basic Hand Gestures', progress: 90 },
        { name: 'Combined Mudras', progress: 60 },
        { name: 'Expressive Gestures', progress: 40 }
      ]
    },
    {
      category: 'Footwork',
      skills: [
        { name: 'Basic Steps', progress: 85 },
        { name: 'Adavus', progress: 70 },
        { name: 'Complex Patterns', progress: 30 }
      ]
    },
    {
      category: 'Expression',
      skills: [
        { name: 'Facial Expressions', progress: 75 },
        { name: 'Emotional Portrayal', progress: 55 },
        { name: 'Character Interpretation', progress: 45 }
      ]
    }
  ];

  const nextMilestones = [
    {
      name: 'Advanced Mudras',
      description: 'Master 10 advanced hand gestures',
      progress: 60,
      reward: '200 Guru Points'
    },
    {
      name: 'Performance Ready',
      description: 'Complete 3 full dance sequences',
      progress: 40,
      reward: 'Performance Badge'
    },
    {
      name: 'Rhythm Master',
      description: 'Master all basic tala patterns',
      progress: 75,
      reward: '300 Guru Points'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">My Journey</h1>
          <p className="text-orange-700 mt-1">Your dance learning progress and achievements</p>
        </div>
        
        {/* Timeframe Filter */}
        <div className="flex gap-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.id}
              className={`btn ${
                selectedTimeframe === timeframe.id
                  ? 'bg-orange-100 text-orange-900 border-orange-200'
                  : 'bg-white text-orange-800 border-orange-100 hover:bg-orange-50'
              }`}
              onClick={() => setSelectedTimeframe(timeframe.id)}
            >
              {timeframe.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card bg-white shadow-lg p-4">
          <div className="flex items-center gap-3">
            <RiTimeLine className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-sm text-orange-700">Total Hours</div>
              <div className="text-xl font-bold text-orange-900">{practiceStats.totalHours}h</div>
            </div>
          </div>
        </div>
        <div className="card bg-white shadow-lg p-4">
          <div className="flex items-center gap-3">
            <RiCalendarLine className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-sm text-orange-700">Sessions</div>
              <div className="text-xl font-bold text-orange-900">{practiceStats.totalSessions}</div>
            </div>
          </div>
        </div>
        <div className="card bg-white shadow-lg p-4">
          <div className="flex items-center gap-3">
            <RiBarChartLine className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-sm text-orange-700">Avg. Accuracy</div>
              <div className="text-xl font-bold text-orange-900">{practiceStats.averageAccuracy}%</div>
            </div>
          </div>
        </div>
        <div className="card bg-white shadow-lg p-4">
          <div className="flex items-center gap-3">
            <RiStarLine className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-sm text-orange-700">Current Streak</div>
              <div className="text-xl font-bold text-orange-900">{practiceStats.currentStreak} days</div>
            </div>
          </div>
        </div>
        <div className="card bg-white shadow-lg p-4">
          <div className="flex items-center gap-3">
            <RiMedalLine className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-sm text-orange-700">Best Streak</div>
              <div className="text-xl font-bold text-orange-900">{practiceStats.bestStreak} days</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-orange-900">Skill Progress</h2>
              <div className="space-y-6 mt-4">
                {skillProgress.map((category, index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="font-medium text-orange-800">{category.category}</h3>
                    <div className="space-y-3">
                      {category.skills.map((skill, skillIndex) => (
                        <div key={skillIndex}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-orange-900">{skill.name}</span>
                            <span className="text-orange-600">{skill.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-orange-100 rounded-full">
                            <div
                              className="h-full bg-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${skill.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Next Milestones */}
        <div className="space-y-6">
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-orange-900">Next Milestones</h2>
              <div className="space-y-4 mt-4">
                {nextMilestones.map((milestone, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-medium text-orange-900">{milestone.name}</h3>
                    <p className="text-sm text-orange-700">{milestone.description}</p>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-orange-600">{milestone.progress}%</span>
                      <span className="text-orange-600">Reward: {milestone.reward}</span>
                    </div>
                    <div className="w-full h-2 bg-orange-100 rounded-full">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Practice History */}
      <div className="card bg-white shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-orange-900">Practice History</h2>
          <div className="space-y-6 mt-4">
            {progressHistory.map((entry, index) => (
              <div key={index} className="border-b border-orange-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <RiCalendarLine className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-900">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-orange-700">{entry.hours} hours</span>
                    <span className="text-sm text-orange-700">{entry.accuracy}% accuracy</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {entry.highlights.map((highlight, hIndex) => (
                      <span
                        key={hIndex}
                        className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-orange-700">{entry.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 