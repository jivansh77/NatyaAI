import React from 'react';

export default function PosePractice() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <iframe
        src="http://localhost:5010"
        className="w-full h-full border-none"
        title="Bharatanatyam Pose Detection"
      />
    </div>
  );
} 