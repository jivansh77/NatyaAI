import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { 
  RiDashboardLine, 
  RiVideoLine,
  RiBookLine,
  RiGroupLine,
  RiTrophyLine,
  RiHeartLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiMapPin2Fill,
} from 'react-icons/ri';
import { GiLotus, GiPeaceDove } from 'react-icons/gi';

export default function Sidebar() {
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [guruScore, setGuruScore] = useState(0);

  useEffect(() => {
    const fetchGuruScore = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().achievements) {
          const achievements = userDoc.data().achievements;
          const totalPoints = achievements.reduce((total, achievement) => total + (achievement.points || 0), 0);
          setGuruScore(totalPoints);
        }
      } catch (error) {
        console.error('Error fetching guru score:', error);
      }
    };

    fetchGuruScore();
  }, [user]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: RiDashboardLine },
    { name: 'Practice Studio', href: '/practice-studio', icon: RiVideoLine },
    { name: 'Cultural Timeline', href: '/timeline', icon: RiBookLine },
    { name: 'NatyaSangam', href: '/natya-sangam', icon: RiGroupLine },
    { name: 'Achievements', href: '/achievements', icon: RiTrophyLine },
    { name: 'Event Map', href: '/journey', icon: RiMapPin2Fill },
  ];

  const dailyQuote = {
    text: "Dance is the hidden language of the soul",
    author: "Martha Graham"
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <>
    <div className={`fixed h-screen overflow-y-auto border-r border-orange-100 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-orange-50 to-pink-50 text-base-content z-50`}>
      <div className="flex flex-col h-full">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-20 px-4 bg-gradient-to-r from-orange-100 to-pink-100`}>
          <div className="flex items-center gap-3">
            <Link to="/" className="cursor-pointer">
              <GiLotus className="w-8 h-8 text-orange-600" />
            </Link>
            {!isCollapsed && (
              <Link to="/">
                <h2 className="text-2xl font-bold text-orange-800">NatyaAI</h2>
              </Link>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-orange-100 rounded-lg p-2 hover:bg-orange-200"
          >
            {isCollapsed ? 
              <RiArrowRightLine className="w-4 h-4 text-orange-600" /> : 
              <RiArrowLeftLine className="w-4 h-4 text-orange-600" />
            }
          </button>
        </div>
        
        {/* Daily Quote */}
        {!isCollapsed && (
          <div className="px-4 py-3 bg-orange-50/50">
            <p className="text-sm italic text-orange-800">{dailyQuote.text}</p>
            <p className="text-xs text-orange-600 mt-1">- {dailyQuote.author}</p>
          </div>
        )}
        
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-100 text-orange-900'
                    : 'hover:bg-orange-50 text-orange-800'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} ${isActive ? 'text-orange-700' : 'text-orange-600'}`} />
                {!isCollapsed && item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className={`p-4 border-t border-orange-100 ${isCollapsed ? 'text-center' : ''}`}>
          <div className="dropdown dropdown-top">
            <div tabIndex={0} role="button" className={`flex items-center cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full ring-2 ring-orange-200"
                  src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                  alt="User avatar"
                />
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-900">{user?.displayName || user?.email || 'Guest Dancer'}</p>
                  <div className="flex items-center">
                    <GiPeaceDove className="w-4 h-4 text-orange-600 mr-1" />
                    <p className="text-xs text-orange-700">Guru Score: {guruScore}</p>
                  </div>
                </div>
              )}
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
              {user ? (
                <li><button onClick={handleSignOut} className="text-red-600">Sign Out</button></li>
              ) : (
                <li><Link to="/signin" className="text-orange-600">Sign In</Link></li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <main className="min-h-screen">
          {/* This will wrap around the page content */}
        </main>
      </div>
    </>
  );
}