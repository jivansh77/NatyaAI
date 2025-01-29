import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

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
      const response = await fetch('http://localhost:5000/api/dance-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.response, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        text: "Sorry, I couldn't process your dance-related query at the moment.",
        isUser: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 1000 }}>
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b bg-primary text-white">
            <h2 className="font-semibold">Dance Advisor</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <div ref={chatBoxRef} className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat ${message.isUser ? 'chat-end' : 'chat-start'}`}
              >
                <div className={`chat-bubble ${
                  message.isUser 
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-white'
                } max-w-[80%]`}>
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat chat-start">
                <div className="chat-bubble bg-gray-200">
                  Thinking about dance...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about classical or folk dances..."
              className="input input-bordered flex-1 bg-gray-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}

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
          className="bg-primary hover:bg-primary-focus text-white p-4 rounded-full shadow-lg transition-all duration-200 ease-in-out hover:scale-105"
        >
          <MessageCircle size={24} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;