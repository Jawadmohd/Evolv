import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import './video.css';

const VideoSuggestion = () => {
  const [videos, setVideos] = useState([]);
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (username) {
      axios
        .get('http://localhost:8080/api/videos/all', { params: { username } })
        .then(res => setVideos(res.data))
        .catch(err => console.error('Error fetching videos:', err));
    }
  }, [username]);

  return (
    <Layout>
      <div className="main-content">
        <h2 className="video-heading">Suggested Videos for You</h2>

        <div className="video-grid">
          {videos.map((video, idx) => (
            <div key={idx} className="video-card">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="video-thumbnail"
              />
              <h3 className="video-title">{video.title}</h3>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                Watch Now
              </a>
            </div>
          ))}
        </div>

        <div className="todays-goal">
          <h3>Today's Learning Goal</h3>
          <p>Complete 2 video tutorials from your recommended list</p>
        </div>
      </div>
    </Layout>
  );
};

export default VideoSuggestion;
