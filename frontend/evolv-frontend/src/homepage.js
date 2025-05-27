// src/homepage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Layout from './Layout';
import QuizPreview from './QuizPreview';
import TodoPreview from './TodoPreview';
import VideoPreview from './VideoPreview';
import './homepage.css';
import { MessageCircle } from 'lucide-react';
import { useTheme } from './themecontext';

export default function Homepage() {
  const [quote, setQuote]       = useState('');
  const [deleteCount, setCount] = useState(0);
  const username                = localStorage.getItem('username');
  const profession              = localStorage.getItem('profession');
  const navigate                = useNavigate();
  const { activeChallenge }     = useTheme();

  // fetch random quote
  useEffect(() => {
    axios.get('http://localhost:8080/api/quotes')
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        if (arr.length) setQuote(arr[Math.floor(Math.random() * arr.length)].quote);
      })
      .catch(console.error);
  }, []);

  // fetch only the total deletion count
  useEffect(() => {
    if (!username) return;
    axios.get(`http://localhost:8080/api/tasks/count?username=${username}`)
      .then(res => setCount(res.data.count ?? 0))
      .catch(console.error);
  }, [username]);

  // build a single‐bar dataset
  const chartData = [
    { label: 'All time', value: deleteCount }
  ];

  return (
    <Layout>
      <div className="main-content">
        <header className="dashboard-header">
          <h1 className="welcome-back">
            {activeChallenge
              ? `challenge is going on! - ${username}`
              : `Welcome back, ${username} 👋`
            }
          </h1>
          <div className="quote-widget card">
            💡 {quote || 'Loading quote...'}
          </div>
        </header>

        <div className="dashboard-grid">
          {/* 1) Single‐bar Chart */}
          <div className="chart-card card">
            <h2>📊 Total Tasks Completed</h2>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData} margin={{ top: 10, bottom: 0 }}>
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }} 
                  stroke="var(--text-light)" 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  formatter={val => [`${val}`, 'Deleted']} 
                />
                <Bar 
                  dataKey="value" 
                  barSize={40} 
                  fill="var(--primary)" 
                  radius={[4,4,0,0]} 
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="kpi">
              You’ve completed <strong>{deleteCount}</strong> task{deleteCount !== 1 ? 's' : ''}.
            </p>
          </div>

          {/* 2) Two-column subgrid */}
          <div className="dashboard-subgrid">
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
          </div>

          {/* 3) Video suggestions */}
          <section className="card video-section">
            <h2>🎥 Recommended Videos</h2>
            <VideoPreview username={username} />
            <Link to="/videosuggestions" className="card-link">
              Browse all →
            </Link>
          </section>
        </div>

        {/* 4) Floating chat icon */}
        <button
          className="chat-button"
          onClick={() => navigate('/chatbot')}
          title="Ask your assistant"
        >
          <MessageCircle size={24} />
        </button>
      </div>
    </Layout>
  );
}
