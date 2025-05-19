import React, { useState, useEffect, useRef } from 'react';
import Layout from './Layout';
import './chatbot.css';

export default function ChatbotApp() {
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hello! Ask me anything.' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    const loadingMsg = { from: 'bot', text: '...', isLoading: true };
    setMessages(prev => [...prev, loadingMsg]);

    try {
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      const botText = data.reply || "Sorry, I didn't get that.";

      setMessages(prev => [
        ...prev.filter(msg => !msg.isLoading),
        { from: 'bot', text: botText }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev.filter(msg => !msg.isLoading),
        { from: 'bot', text: 'Server error. Try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <Layout>
      <div className="chat-container">
        <div className="chat-header">
          <h2>Chat Assistant</h2>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.from}`}>
              {msg.isLoading ? (
                <div className="spinner" />
              ) : (
                <div className="message-bubble">
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
          />
          <button 
            onClick={sendMessage} 
            className="send-button"
            disabled={isLoading}
          >
            ↑
          </button>
        </div>
      </div>
    </Layout>
  );
}