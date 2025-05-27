// src/VideoPreview.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VideoPreview.css';

// In-memory cache for previews per user
const videoCachePreview = {};

const VideoPreview = ({ username: propUsername }) => {
  // Keep username in React state so we re-fetch when it changes
  const [username, setUsername] = useState(
    propUsername || localStorage.getItem('username') || ''
  );
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch videos with caching
  const fetchVideos = async (user) => {
    if (!user) {
      setVideos([]);
      setLoading(false);
      return;
    }

    // Use cache if available
    if (videoCachePreview[user]) {
      setVideos(videoCachePreview[user]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/videos/all?username=${encodeURIComponent(user)}`
      );
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];
      // Cache results
      videoCachePreview[user] = data;
      setVideos(data);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Update username when prop or storage changes
  useEffect(() => {
    setUsername(propUsername || localStorage.getItem('username') || '');
  }, [propUsername]);

  useEffect(() => {
    // Clear cache on logout
    if (!username) {
      Object.keys(videoCachePreview).forEach((key) => delete videoCachePreview[key]);
    }
    fetchVideos(username);
  }, [username]);

  // Listen for localStorage updates in other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'username') {
        setUsername(e.newValue || '');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (loading) {
    return <p>Loading videos...</p>;
  }

  if (videos.length === 0) {
    return <p>No video suggestions available.</p>;
  }

  return (
    <div className="video-grid-container">
      <div className="video-grid">
        {videos.slice(0, 2).map((v, i) => (
          <div key={i} className="video-card">
            <img
              src={v.thumbnail}
              alt={v.title}
              className="video-thumbnail"
            />
            <div className="video-content">
              <div className="video-title">{v.title}</div>
              <div className="video-meta">
                <span className="duration">{v.duration}</span>
                <span className="views">{v.views} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPreview;