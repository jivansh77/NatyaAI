import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import PracticeStudio from './pages/PracticeStudio'
import Timeline from './pages/Timeline'
import NatyaSangam from './pages/NatyaSangam'
import Achievements from './pages/Achievements'
import Journey from './pages/Journey'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import DanceForm from './pages/Form'
import CulturalFactPopup from './components/CulturalFactPopup'

const AppContent = () => {
  const location = useLocation();
  const showSidebar = !['/signin', '/signup', '/form'].includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {showSidebar && <Sidebar />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/practice-studio" element={<PracticeStudio />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/natya-sangam" element={<NatyaSangam />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/form" element={<DanceForm />} />
          <Route path="/popup" element={<CulturalFactPopup/>}/>
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}