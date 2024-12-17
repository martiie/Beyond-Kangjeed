'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { findSimilar } from '../app/chat-bot/find_similar';

export default function ChatBot({ isOpenChat, setIsOpenChat }) {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [selectedMessage, setSelectedMessage] = useState(null)
  const overlayContentRef = useRef(null)

  const handleSendMessage = async () => {
    if (userMessage.trim() === '') return;

    const newUserMessage = { role: 'user', content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserMessage('');
    setLoading(true);

    try {
      const botResponse = await findSimilar(userMessage);
      console.log('Response from findSimilar:', botResponse);

      if (!botResponse) {
        throw new Error('Failed to fetch response from API');
      }

      // Use botResponse directly
      const botMessage = { role: 'assistant', content: botResponse };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'ขออภัยค่ะ เกิดข้อผิดพลาดในการค้นหาคำตอบ กรุณาลองใหม่อีกครั้ง' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpenChat) return null;

  const handleMessageClick = (message) => {
    if (message.role === "assistant") {
      setSelectedMessage(message)
    }
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg border overflow-hidden" style={{ zIndex: 1000, boxShadow: '0px 0px 4px 2px rgb(0, 0, 0, 0.065' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-white border-b">
          <h1 className="text-md font-semibold">ChatBot</h1>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => setIsOpenChat(false)}
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-start gap-2`}
              onClick={() => handleMessageClick(message)}
            >
              {message.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex-shrink-0" />
              )}
              <div
                className={`max-w-[70%] p-2 rounded-lg text-sm ${message.role === "user"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-white border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-100"
                  }`}
                style={{ marginBottom: "4px", marginTop: "4px" }}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-2 bg-white">
          <div className="flex items-center bg-gray-100 rounded-full">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none"
              placeholder="ถามอะไรก็อย่าง..."
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="p-2 text-black transition-colors mr-1"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 20 20" className="w-5 h-5 rotate-90 fill-current">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for selected message */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4"
          style={{ zIndex: 1003 }}
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full max-h-[60vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex-shrink-0">
                <h2 className="text-xl font-bold ml-8">ChatBot</h2>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              ref={overlayContentRef}
              className="p-4 overflow-y-auto flex-grow bg-gray-50 rounded-lg"
            >
              <p className="text-gray-800">{selectedMessage.content}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}