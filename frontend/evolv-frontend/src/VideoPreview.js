import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VideoPreview.css';

const VideoPreview = ({
  username = localStorage.getItem('username')
}) => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/videos/all?username=${username}`)
      .then(res => {
        // handle both direct-array and { data: [...] } responses
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setVideos(data);
      })
      .catch(err => {
        console.error('Error fetching videos:', err);
        setVideos([]);
      });
  }, [username]);

  return (
    <div className="video-grid-container">
      <div className="video-grid">
        {videos.map((v, i) => (
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
