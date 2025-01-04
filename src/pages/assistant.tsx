import React, { useState, useRef } from 'react';
import NavigationBar from '../app/component/NavigationBar';
import '../globals.css';

interface Message {
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAssistantResponding, setIsAssistantResponding] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = () => {
    if (input.trim() === '' || isAssistantResponding) return;

    const newMessage: Message = {
      content: input,
      sender: 'user',
      timestamp: getCurrentTime(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    scrollToBottom();

    setIsAssistantResponding(true);

    // 模擬助理回應
    const assistantReplies = [
      '你好，有什麼我可以幫助的嗎？',
      '這是一個模擬的助理回應。',
      '請稍等，我正在處理您的請求。',
    ];
    setTimeout(() => {
      const assistantReply: Message = {
        content: assistantReplies[Math.floor(Math.random() * assistantReplies.length)],
        sender: 'assistant',
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, assistantReply]);
      setIsAssistantResponding(false);
      scrollToBottom();
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      <NavigationBar />
      <div className="container mx-auto my-12 p-6 max-w-screen-md rounded-xl shadow-lg bg-gray-100 mt-32">
        <h1 className="text-center text-2xl font-bold text-gray-800 mb-6">
          Assistant Chatbot
        </h1>
        <div className="chat-messages overflow-y-auto h-80 p-4 bg-white rounded-md shadow-inner">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 ${
                msg.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <span
                className={`inline-block px-4 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-[#9E8DC2] text-white'
                    : 'bg-gray-300 text-gray-800'
                }`}
              >
                {msg.content}
              </span>
              <div
                className={`text-xs mt-1 ${
                  msg.sender === 'user' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-container flex mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-[#9E8DC2]"
            placeholder="輸入訊息..."
            disabled={isAssistantResponding}
          />
          <button
            onClick={handleSend}
            className={`ml-2 px-4 py-2 font-semibold rounded-lg shadow-md transition ${
              isAssistantResponding || input.trim() === ''
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-50'
                : 'bg-[#9E8DC2] text-white hover:opacity-90'
            }`}
            disabled={isAssistantResponding || input.trim() === ''}
          >
            {isAssistantResponding ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              '送出'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}