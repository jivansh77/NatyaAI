import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const Chatbot = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    text: "Hello! I'm your Dance Advisor. You can ask me about classical dances like Bharatanatyam, Kathak, Odissi, or folk dances from around the world. How can I help you today?",
    isUser: false
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dragRef = useRef(null);
  const chatBoxRef = useRef(null);
  const initialPos = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const startX = e.pageX - position.x;
    const startY = e.pageY - position.y;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.pageX - startX,
        y: e.pageY - startY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);

    try {
      const response = await fetch('http://127.0.0.1:1024/api/dance-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.response, isUser: false }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, I couldn't process your dance-related query at the moment.",
        isUser: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 1000 }}>
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl border border-orange-100 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h2 className="font-semibold">Dance Advisor</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-orange-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatBoxRef} 
            className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-orange-50 to-pink-50"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser 
                    ? 'bg-orange-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 shadow-md rounded-bl-none'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 p-3 rounded-lg shadow-md rounded-bl-none max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={sendMessage} className="p-4 border-t border-orange-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about classical or folk dances..."
                className="flex-1 px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:border-orange-500 bg-orange-50"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chat Button */}
      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'relative',
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'all 0.3s ease-in-out',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <button
          onClick={() => !isDragging && setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out hover:scale-105 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;