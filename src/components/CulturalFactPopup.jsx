import React, { useEffect, useState } from "react";
import axios from "axios";

const Cloud = ({ className }) => (
  <svg
    viewBox="0 0 178 94"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M155.5 94H22.5C10.0766 94 0 83.9234 0 71.5C0 59.0766 10.0766 49 22.5 49C23.9106 49 25.2876 49.1504 26.6125 49.4375C26.5419 48.6335 26.5 47.8179 26.5 46.9904C26.5 25.4655 43.9655 8 65.4904 8C82.4465 8 96.9466 18.5369 102.367 33.4912C105.73 31.9669 109.473 31.1 113.432 31.1C119.699 31.1 125.468 33.2965 129.901 36.9094C134.117 31.7458 140.445 28.4 147.5 28.4C161.307 28.4 172.5 39.5929 172.5 53.4C172.5 54.5322 172.409 55.6456 172.233 56.7321C175.787 59.9334 178 64.4615 178 69.5C178 82.7548 167.755 93 154.5 93L155.5 94Z"
      fill="white"
      fillOpacity="0.8"
    />
  </svg>
);

const CulturalFactPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [fact, setFact] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch cultural fact from backend
  const fetchFact = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/fact/", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      setFact(response.data.fact);
    } catch (error) {
      console.error('Error fetching fact:', error);
      setError("Unable to fetch fact. Please try again later.");
      setFact("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for 2 minutes before showing the popup
    const timer = setTimeout(() => {
      fetchFact(); // Fetch fact from backend
      setShowPopup(true);
    }, 60000); // 2 minutes = 120000ms

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  if (!showPopup) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-50 bg-black/30 flex justify-center items-center overflow-hidden">
      {/* Close Button */}
      <button
        onClick={() => setShowPopup(false)}
        className="absolute top-5 right-5 bg-white w-10 h-10 rounded-full shadow-lg flex justify-center items-center text-xl font-bold hover:bg-gray-100 transition-colors"
      >
        ✕
      </button>

      {/* Animated Clouds */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Fast Moving Clouds - Left to Right */}
        <Cloud className="absolute w-[250px] opacity-70 animate-float-fast left-[-250px] top-1/6" />
        <Cloud className="absolute w-[180px] opacity-60 animate-float-fast left-[-180px] top-2/3 delay-1000" />
        
        {/* Medium Speed Clouds - Left to Right */}
        <Cloud className="absolute w-[300px] opacity-80 animate-float-medium left-[-300px] top-1/4" />
        <Cloud className="absolute w-[220px] opacity-75 animate-float-medium left-[-220px] top-3/4 delay-500" />
        
        {/* Slow Moving Clouds - Left to Right */}
        <Cloud className="absolute w-[280px] opacity-65 animate-float-slow left-[-280px] top-1/3" />
        <Cloud className="absolute w-[200px] opacity-55 animate-float-slow left-[-200px] top-2/4 delay-700" />

        {/* Fast Moving Clouds - Right to Left */}
        <Cloud className="absolute w-[230px] opacity-75 animate-float-reverse-fast right-[-230px] top-1/5" />
        <Cloud className="absolute w-[170px] opacity-65 animate-float-reverse-fast right-[-170px] top-3/5 delay-300" />

        {/* Medium Speed Clouds - Right to Left */}
        <Cloud className="absolute w-[260px] opacity-70 animate-float-reverse-medium right-[-260px] top-2/5" />
        <Cloud className="absolute w-[190px] opacity-60 animate-float-reverse-medium right-[-190px] top-4/5 delay-800" />

        {/* Vertical Moving Clouds */}
        <Cloud className="absolute w-[220px] opacity-50 animate-float-up left-1/4 top-[100%]" />
        <Cloud className="absolute w-[240px] opacity-60 animate-float-down right-1/4 top-[-100px] delay-500" />
      </div>

      {/* Display Fact */}
      <div className="relative bg-white/70 backdrop-blur-sm p-8 rounded-xl text-center shadow-xl max-w-md mx-4 animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-orange-900">Cultural History Fact</h2>
        {isLoading ? (
          <div className="flex justify-center items-center space-x-2 py-4">
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce" />
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-100" />
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-200" />
          </div>
        ) : error ? (
          <p className="text-red-600 py-4">{error}</p>
        ) : (
          <p className="text-lg text-gray-800 leading-relaxed">{fact}</p>
        )}
      </div>
    </div>
  );
};

export default CulturalFactPopup;
