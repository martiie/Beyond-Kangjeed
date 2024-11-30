"use client"
import { useState } from 'react';
import { fetchGPTResponse } from './api';

// Custom SVG icons
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M21 11V8a2 2 0 0 0-2-2h-6L9 2H5a2 2 0 0 0-2 2v7"></path>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default function ChatBotPage() {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (userMessage.trim() === '') return;

    setLoading(true);
    const newUserMessage = { role: 'user', content: userMessage };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setUserMessage('');

    try {
      const data = await fetchGPTResponse(userMessage);
      const botResponse = { role: 'bot', content: data.choices[0].message.content };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      const errorMessage = { role: 'bot', content: 'Sorry, there was an error. Please try again.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-100 to-purple-100">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg mt-8 mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Chat with GPT</h1>

        <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}>
                <div className="flex items-center mb-1">
                  {message.role === 'user' ? <UserIcon /> : <BotIcon />}
                  <span className="font-semibold ml-2">{message.role === 'user' ? 'You' : 'GPT'}</span>
                </div>
                <p>{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask me anything..."
          />
          <button
            onClick={handleSendMessage}
            disabled={loading}
            className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? (
              <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin"></div>
            ) : (
              <SendIcon />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

