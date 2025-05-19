// src/components/ChatbotPreview.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ChatbotPreview.css';

const ChatbotPreview = () => {
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .post('http://localhost:8080/api/chat', { message: 'one line productivity tip' })
      .then(res => {
        const text = res.data.reply || res.data.content || 'No response';
        setReply(text);
      })
      .catch(() => setReply('⚠️ Unable to fetch chat reply'))
      .finally(() => setLoading(false));
  }, []);

  const handleClick = () => {
    navigate('/chat');
  };

  return (
    <div className="preview-box chatbot-preview-box" onClick={handleClick}>
      {loading ? (
        <p className="chat-preview loading">Loading...</p>
      ) : (
        <p className="chat-preview">{reply}</p>
      )}
    </div>
  );
};

export default ChatbotPreview;