import React, { useState, useEffect, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Layout from './Layout';
import './chatbot.css';

export default function ChatbotApp() {
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hello! Ask me short questions.' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const typingRef = useRef('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setMessages(m => [...m, { from: 'user', text: input }]);
    setInput('');
    setTypingText('');
    typingRef.current = '';
    setIsLoading(true);

    try {
      await fetchEventSource('http://localhost:8080/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
        onmessage(event) {
          let chunk = event.data;
          if (!chunk.trim()) return;

          // collapse whitespace in this chunk
          chunk = chunk.replace(/\s+/g, ' ');

          // smart spacing
          const prev = typingRef.current;
          const needsSpace = prev && !prev.endsWith(' ') && !chunk.startsWith(' ');
          typingRef.current = prev + (needsSpace ? ' ' : '') + chunk;
          setTypingText(typingRef.current);
        },
        onclose() {
          const finalText = typingRef.current.trim();
          if (finalText) {
            setMessages(m => [...m, { from: 'bot', text: finalText }]);
          }
          setTypingText('');
          setIsLoading(false);
        },
        onerror(err) {
          console.error('SSE Error:', err);
          setMessages(m => [...m, { from: 'bot', text: '⚠️ Error processing request' }]);
          setTypingText('');
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessages(m => [...m, { from: 'bot', text: '⚠️ Connection error' }]);
      setTypingText('');
      setIsLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Layout>
      <div className="chat-container">
        <header className="chat-header"><h2>Chat Assistant</h2></header>

        <section className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.from}`}>
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))}

          {typingText && (
            <div className="chat-message bot">
              <div className="message-bubble typing-indicator">
                {typingText}<span className="cursor">|</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </section>

        <footer className="chat-input">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a short question..."
            disabled={isLoading}
            rows={1}
          />
          <button onClick={sendMessage} disabled={isLoading}>↑</button>
        </footer>
      </div>
    </Layout>
  );
}
