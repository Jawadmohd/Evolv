import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import Layout from './Layout';
import './video.css';

// Simple in-memory cache: videos per user
const videoCache = {};

const VideoSuggestion = () => {
  const currentUser = localStorage.getItem('username') || '';
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVideo, setModalVideo] = useState(null);

  const fetchVideos = async (user) => {
    if (!user) return setVideos([]), setLoading(false);
    if (videoCache[user]) return setVideos(videoCache[user]), setLoading(false);
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/videos/all?username=${encodeURIComponent(user)}`
      );
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.data)
        ? raw.data
        : [];
      videoCache[user] = list;
      setVideos(list);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) Object.keys(videoCache).forEach(key => delete videoCache[key]);
    fetchVideos(currentUser);
  }, [currentUser]);

  const openModal = (url) => setModalVideo(url);
  const closeModal = () => setModalVideo(null);

  return (
    <Layout>
      <div className="main-content">
        <h2 className="video-heading">Suggested Videos for You</h2>

        {loading ? (
          <p>Loading videos...</p>
        ) : videos.length === 0 ? (
          <p>No videos found. Try starting a challenge or adding some videos!</p>
        ) : (
          <div className="video-grid">
            {videos.map((video, idx) => (
              <div key={idx} className="video-card">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="video-thumbnail clickable"
                  onClick={() => openModal(video.url)}
                />
                <h3 className="video-title">{video.title}</h3>
              </div>
            ))}
          </div>
        )}

        <div className="todays-goal">
          <h3>Today's Learning Goal</h3>
          <p>Complete 2 video tutorials from your recommended list</p>
        </div>

        {modalVideo && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-button" onClick={closeModal}>×</button>
              <ReactPlayer
                url={modalVideo}
                controls
                width="100%"
                height="100%"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VideoSuggestion;