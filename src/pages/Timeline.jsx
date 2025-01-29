import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { FaMusic, FaInfoCircle, FaPlay, FaPause } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import backgroundMusic from '../assets/background-music.mp3';
import templePattern from '../assets/temple-dance.jpg';

const Timeline = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const audioRef = useRef(new Audio(backgroundMusic));
  const [scrollProgress, setScrollProgress] = useState(0);

  const timelineEvents = [
    {
      year: "2nd Century BCE",
      title: "Ancient Origins",
      description: "Bharatanatyam's roots trace back to the ancient Sanskrit text 'Natya Shastra' by Bharata Muni, establishing the foundation of Indian classical dance.",
      image: "/public/images/ancient-origins.jpg",
      details: "The Natya Shastra comprehensively covers all aspects of classical dance, including hand gestures (mudras), facial expressions (abhinaya), and body movements.",
      category: "Origins"
    },
    {
      year: "6th-12th Century CE",
      title: "Temple Dance Tradition",
      description: "Flourishing period of the Devadasi system in South Indian temples, particularly during the Chola dynasty.",
      image: "/public/images/temple-dance.jpg",
      details: "Devadasis were dedicated temple dancers who preserved and evolved the art form through generations.",
      category: "Evolution"
    },
    {
      year: "20th Century",
      title: "Modern Revival",
      description: "The renaissance of Bharatanatyam through pioneers like Rukmini Devi Arundale, who established Kalakshetra.",
      image: "/public/images/modern-revival.jpg",
      details: "This period marked the transformation of Bharatanatyam from a temple art to a globally recognized classical dance form.",
      category: "Modern Era"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      audioRef.current.pause(); // Cleanup audio on unmount
    };
  }, []);

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Audio playback failed:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const TimelineEvent = ({ event, index }) => {
    const [ref, inView] = useInView({
      threshold: 0.2,
      triggerOnce: true
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, delay: index * 0.2 }}
        className="relative mb-20"
      >
        <Parallax y={[-20, 20]} className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="event-content">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-red-900/90 to-red-800/90 p-8 rounded-lg shadow-xl border border-gold/30"
              >
                <span className="text-gold text-sm font-semibold">{event.year}</span>
                <h3 className="text-2xl font-serif text-gold mb-4">{event.title}</h3>
                <p className="text-cream/90 mb-4">{event.description}</p>
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="text-gold hover:text-cream flex items-center gap-2 transition-colors"
                >
                  <FaInfoCircle /> Learn More
                </button>
              </motion.div>
            </div>
            <div className="event-image">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-lg shadow-2xl"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </motion.div>
            </div>
          </div>
        </Parallax>
      </motion.div>
    );
  };

  return (
    <ParallaxProvider>
      <div className="min-h-screen bg-deepred text-cream font-poppins relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="fixed inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url(${templePattern})`,
            backgroundSize: '400px',
            backgroundRepeat: 'repeat'
          }}
        />

        {/* Progress Indicator */}
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 h-64 w-1 bg-gold/30 rounded-full z-50">
          <motion.div
            className="w-full bg-gold rounded-full"
            initial={{ height: 0 }}
            animate={{ height: `${scrollProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Music Toggle */}
        <button
          onClick={toggleMusic}
          className="fixed bottom-8 right-8 bg-gold/90 hover:bg-gold p-4 rounded-full shadow-lg transition-colors z-50"
          aria-label={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? <FaPause className="w-6 h-6" /> : <FaPlay className="w-6 h-6" />}
        </button>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-16 relative">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
          >
            <h1 className="text-5xl font-serif text-gold mb-6">
              The Journey of Bharatanatyam
            </h1>
            <p className="text-xl text-cream/80 max-w-2xl mx-auto">
              Explore the rich history and evolution of one of India's most ancient and revered classical dance forms
            </p>
          </motion.header>

          <div className="timeline-content space-y-32">
            {timelineEvents.map((event, index) => (
              <TimelineEvent key={index} event={event} index={index} />
            ))}
          </div>
        </div>

        {/* Event Detail Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <Dialog
              open={!!selectedEvent}
              onClose={() => setSelectedEvent(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-deepred border border-gold/30 rounded-lg p-8 max-w-2xl w-full shadow-2xl relative z-50"
              >
                <h2 className="text-3xl font-serif text-gold mb-4">{selectedEvent.title}</h2>
                <p className="text-cream/90 mb-6">{selectedEvent.details}</p>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 text-gold hover:text-cream"
                >
                  ✕
                </button>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </ParallaxProvider>
  );
};

export default Timeline; 