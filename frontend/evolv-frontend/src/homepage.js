import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import QuizPreview from './QuizPreview';
import TodoPreview from './TodoPreview';
import ChatbotPreview from './ChatbotPreview';
import VideoPreview from './VideoPreview';
import './homepage.css';

export default function Homepage() {
  const [quote, setQuote] = useState('');
  const username   = localStorage.getItem('username');
  const profession = localStorage.getItem('profession');

  useEffect(() => {
    axios.get('http://localhost:8080/api/quotes')
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        if (arr.length) {
          setQuote(arr[Math.floor(Math.random() * arr.length)].quote);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Layout>
      <div className="main-content">
        <header className="dashboard-header">
          <h1 className="welcome-back">
            Welcome back, {username} 👋
          </h1>
          <div className="quote-widget card">
            💡 {quote || 'Loading quote...'}
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="card todo-card">
            <h2>📋 Your Tasks</h2>
            <TodoPreview username={username} />
            <Link to="/todo" className="card-link">
              View all tasks →
            </Link>
          </section>

          <section className="card quiz-card">
            <h2>🧠 Daily Quiz</h2>
            <QuizPreview profession={profession} />
            <Link to="/quiz" className="card-link">
              Take full quiz →
            </Link>
          </section>

          <section className="card chatbot-card">
            <h2>🤖 Assistant</h2>
            <ChatbotPreview />
            <Link to="/chatbot" className="card-link">
              Start conversation →
            </Link>
          </section>

          {/* ← This now spans the full width of the grid: */}
          <section className="card video-section">
            <h2>🎥 Recommended Videos</h2>
            <VideoPreview username={username} />
            <Link to="/videos" className="card-link">
              Browse all →
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
}
