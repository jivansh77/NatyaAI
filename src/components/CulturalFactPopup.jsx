import React, { useEffect, useState } from "react";
import axios from "axios";
import cloud1 from "../../public/cloud1.jpeg"; // Adjust path as needed
import cloud2 from "../../public/cloud2.jpeg"; // Adjust path as needed

const CulturalFactPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [fact, setFact] = useState("");
  const [cloud1Translate, setCloud1Translate] = useState("-translate-x-full");
  const [cloud2Translate, setCloud2Translate] = useState("translate-x-full");

  // Function to fetch cultural fact from backend
  const fetchFact = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/fact/");
      setFact(response.data.fact);
    } catch (error) {
      setFact("Unable to fetch fact. Please try again later.");
    }
  };

  useEffect(() => {
    // Wait for 2 minutes before showing the popup
    const timer = setTimeout(() => {
      fetchFact(); // Fetch fact from backend
      setShowPopup(true);
    }, 120); // 2 minutes = 120000ms

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (showPopup) {
      setTimeout(() => {
        setCloud1Translate("translate-x-0");
        setCloud2Translate("translate-x-0");
      }, 100); // Small delay to trigger animation
    }
  }, [showPopup]);

  if (!showPopup) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-50 bg-black/30 flex justify-center items-center">
      {/* Close Button */}
      <button
        onClick={() => setShowPopup(false)}
        className="absolute top-5 right-5 bg-white w-10 h-10 rounded-full shadow-lg flex justify-center items-center text-xl font-bold"
      >
        ✕
      </button>

      {/* Cloud 1 */}
      <img
        src={cloud1}
        alt="Cloud 1"
        className={`absolute top-1/4 left-0 transition-transform duration-[8s] ease-in-out ${cloud1Translate}`}
        width={500}
      />

      {/* Cloud 2 */}
      <img
        src={cloud2}
        alt="Cloud 2"
        className={`absolute top-1/4 right-0 transition-transform duration-[8s] ease-in-out ${cloud2Translate}`}
        width={500}
      />

      {/* Display Fact */}
      <div className="absolute bg-white/70 p-6 rounded-xl text-center shadow-xl max-w-md">
        <h2 className="text-xl font-bold mb-2">Cultural History Fact</h2>
        <p className="text-lg">{fact}</p>
      </div>
    </div>
  );
};

export default CulturalFactPopup;
