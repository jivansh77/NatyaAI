import { useState } from 'react';
import { RiHeartLine, RiHeartFill, RiChat3Line, RiShareLine, RiVideoLine, RiImageLine, RiUserSmileLine, RiSearchLine } from 'react-icons/ri';
import { GiLotus, GiPeaceDove, GiMusicalNotes } from 'react-icons/gi';
import { toast } from 'react-hot-toast';

export default function NatyaSangam() {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [scheduledMentors, setScheduledMentors] = useState(new Set());

  const tabs = [
    { id: 'feed', name: 'Community Feed', icon: RiChat3Line },
    { id: 'events', name: 'Events & Workshops', icon: RiVideoLine },
    { id: 'mentors', name: 'Connect with Gurus', icon: RiUserSmileLine }
  ];

  const communityPosts = [
    {
      id: 1,
      user: {
        name: 'Meera Sharma',
        avatar: '/avatars/meera.jpg',
        level: 'Advanced Dancer',
        badge: 'Performance Expert'
      },
      content: 'Just completed my first Bharatanatyam performance! Thank you to my guru and this amazing community for all the support.',
      media: {
        type: 'image',
        url: 'https://karnatakatourism.org/wp-content/uploads/2020/05/Dane.jpg'
      },
      likes: 124,
      comments: 18,
      timestamp: '2 hours ago',
      isLiked: false
    },
    {
      id: 2,
      user: {
        name: 'Arjun Patel',
        avatar: '/avatars/arjun.jpg',
        level: 'Intermediate',
        badge: 'Rising Star'
      },
      content: 'Looking for tips on perfecting the Tripataka Mudra. Any suggestions from experienced dancers?',
      likes: 45,
      comments: 23,
      timestamp: '4 hours ago',
      isLiked: true
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Bharatanatyam Workshop: Mastering Adavus',
      guru: 'Smt. Padma Subramaniam',
      date: '2024-03-25',
      time: '10:00 AM IST',
      duration: '2 hours',
      level: 'Intermediate',
      participants: 45,
      maxParticipants: 50,
      description: 'Join us for an intensive workshop focusing on perfecting your Adavus. Learn proper techniques and get personalized feedback.',
      image: '/events/workshop-1.jpg'
    },
    {
      id: 2,
      title: 'Virtual Performance Series: Student Showcase',
      guru: 'Multiple Gurus',
      date: '2024-04-01',
      time: '6:00 PM IST',
      duration: '3 hours',
      level: 'All Levels',
      participants: 120,
      maxParticipants: 200,
      description: 'Watch and support fellow dancers as they showcase their progress and artistry in this virtual performance series.',
      image: '/events/showcase-1.jpg'
    }
  ];

  const featuredMentors = [
    {
      id: 1,
      name: 'Smt. Lakshmi Menon',
      avatar: '/gurus/lakshmi.jpg',
      specialization: 'Bharatanatyam',
      experience: '25+ years',
      rating: 4.9,
      students: 1200,
      availability: 'Available for online classes',
      bio: 'Padma Shri awardee with expertise in traditional Bharatanatyam. Dedicated to preserving and teaching classical dance forms.',
      achievements: ['Padma Shri Award', 'Sangeet Natak Akademi Award']
    },
    {
      id: 2,
      name: 'Guru Rajesh Kumar',
      avatar: '/gurus/rajesh.jpg',
      specialization: 'Kathak',
      experience: '20+ years',
      rating: 4.8,
      students: 800,
      availability: 'Limited slots available',
      bio: 'Contemporary classical dance expert specializing in fusion choreography while maintaining traditional roots.',
      achievements: ['National Dance Award', 'Cultural Ambassador']
    }
  ];

  const handleScheduleClass = async (mentor) => {
    // Change button state immediately
    setScheduledMentors(prev => new Set([...prev, mentor.id]));
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorName: mentor.name,
          specialization: mentor.specialization,
          experience: mentor.experience
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast.success('Class scheduled successfully! Check your email for details.');
    } catch (error) {
      console.error('Error scheduling class:', error);
      toast.error('Failed to send email notification.');
      // Note: We're not reverting the button state even if email fails
    }
  };

  const renderActionButton = (mentor) => {
    const isScheduled = scheduledMentors.has(mentor.id);
    
    return (
      <button 
        onClick={() => {
          if (isScheduled) {
            window.location.href = 'https://NatyaAI/call';
          } else {
            handleScheduleClass(mentor);
          }
        }}
        className={`btn ${isScheduled ? 'bg-green-500' : 'bg-orange-500'} text-white hover:opacity-90`}
      >
        {isScheduled ? 'Join Room' : 'Schedule Class'}
      </button>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">NatyaSangam</h1>
          <p className="text-orange-700 mt-1">Connect, Share, and Learn with the Dance Community</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search community..."
            className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:border-orange-400"
          />
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-orange-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-orange-900 border-b-2 border-orange-500'
                : 'text-orange-600 hover:text-orange-900'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="w-5 h-5" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {/* Create Post */}
              <div className="card bg-white shadow-lg">
                <div className="card-body">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <RiUserSmileLine className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Share your dance journey..."
                        className="w-full p-2 border border-orange-200 rounded-lg focus:outline-none focus:border-orange-400"
                      />
                      <div className="flex gap-4 mt-4">
                        <button className="flex items-center gap-2 text-orange-600 hover:text-orange-900">
                          <RiImageLine className="w-5 h-5" />
                          Photo
                        </button>
                        <button className="flex items-center gap-2 text-orange-600 hover:text-orange-900">
                          <RiVideoLine className="w-5 h-5" />
                          Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts */}
              {communityPosts.map((post) => (
                <div key={post.id} className="card bg-white shadow-lg">
                  <div className="card-body">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <RiUserSmileLine className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-orange-900">{post.user.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-orange-600">
                              <span>{post.user.level}</span>
                              {post.user.badge && (
                                <span className="px-2 py-0.5 bg-orange-100 rounded-full">
                                  {post.user.badge}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-orange-600">{post.timestamp}</span>
                        </div>
                        <p className="mt-2 text-orange-800">{post.content}</p>
                        {post.media && (
                          <div className="mt-4 rounded-lg overflow-hidden">
                            {post.media.type === 'image' ? (
                              <img src={post.media.url} alt="" className="w-full h-64 object-cover" />
                            ) : (
                              <video src={post.media.url} className="w-full" controls />
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-6 mt-4">
                          <button className="flex items-center gap-2 text-orange-600 hover:text-orange-900">
                            {post.isLiked ? (
                              <RiHeartFill className="w-5 h-5" />
                            ) : (
                              <RiHeartLine className="w-5 h-5" />
                            )}
                            {post.likes}
                          </button>
                          <button className="flex items-center gap-2 text-orange-600 hover:text-orange-900">
                            <RiChat3Line className="w-5 h-5" />
                            {post.comments}
                          </button>
                          <button className="flex items-center gap-2 text-orange-600 hover:text-orange-900">
                            <RiShareLine className="w-5 h-5" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="card bg-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="card-body">
                    <div className="flex gap-6">
                      <div className="w-48 h-32 rounded-lg overflow-hidden">
                        <img src={event.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-orange-900">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-orange-600">
                          <RiUserSmileLine className="w-5 h-5" />
                          <span>{event.guru}</span>
                        </div>
                        <p className="mt-2 text-orange-700">{event.description}</p>
                        <div className="flex items-center gap-6 mt-4">
                          <div className="text-sm text-orange-600">
                            <span className="font-medium">Date:</span> {event.date}
                          </div>
                          <div className="text-sm text-orange-600">
                            <span className="font-medium">Time:</span> {event.time}
                          </div>
                          <div className="text-sm text-orange-600">
                            <span className="font-medium">Duration:</span> {event.duration}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                            {event.level}
                          </span>
                          <button className="btn bg-orange-500 text-white hover:bg-orange-600">
                            Register Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'mentors' && (
            <div className="space-y-6">
              {featuredMentors.map((mentor) => (
                <div key={mentor.id} className="card bg-white shadow-lg">
                  <div className="card-body">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 rounded-lg overflow-hidden">
                        <img src={mentor.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-orange-900">{mentor.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-orange-600">{mentor.specialization}</span>
                              <span className="text-orange-600">•</span>
                              <span className="text-orange-600">{mentor.experience}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-orange-900 font-medium">{mentor.rating} ★</div>
                            <div className="text-sm text-orange-600">{mentor.students} students</div>
                          </div>
                        </div>
                        <p className="mt-2 text-orange-700">{mentor.bio}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {mentor.achievements.map((achievement, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                            >
                              {achievement}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-orange-600">{mentor.availability}</span>
                          {renderActionButton(mentor)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Stats */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-orange-900">Community Stats</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-900">5,234</div>
                  <div className="text-sm text-orange-600">Active Dancers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-900">128</div>
                  <div className="text-sm text-orange-600">Expert Gurus</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-900">450+</div>
                  <div className="text-sm text-orange-600">Monthly Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-900">15K+</div>
                  <div className="text-sm text-orange-600">Dance Videos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Challenge */}
          <div className="card bg-gradient-to-br from-orange-100 to-pink-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-orange-900">Weekly Challenge</h2>
              <div className="mt-4">
                <h3 className="font-medium text-orange-900">Master the Mudras</h3>
                <p className="mt-2 text-orange-700">
                  Learn and perfect 5 basic mudras this week. Share your progress and win guru points!
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-orange-600">234 participants</span>
                  <button className="btn bg-orange-500 text-white hover:bg-orange-600">
                    Join Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="card bg-white shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-orange-900">Trending Topics</h2>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm cursor-pointer hover:bg-orange-200">
                  #BharatanatyamBasics
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm cursor-pointer hover:bg-orange-200">
                  #MudraChallenge
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm cursor-pointer hover:bg-orange-200">
                  #ClassicalDance
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm cursor-pointer hover:bg-orange-200">
                  #DanceJourney
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
