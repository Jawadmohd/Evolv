import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { useTheme } from "./themecontext";
import './challenge.css';

const Challenge = () => {
  const [challenges, setChallenges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({ challenge: "", duration: "" });
  const { activeChallenge, setActiveChallenge } = useTheme();

  const username = localStorage.getItem("username");

  // 1. fetch all challenges
  const fetchChallenges = async () => {
    try {
      const { data } = await axios.get("http://localhost:8080/api/challenges");
      setChallenges(data);
    } catch (err) {
      console.error("Error fetching challenges:", err);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // 2. detect if user has an unfinished challenge
  useEffect(() => {
    const has = challenges.some(ch => ch.username === username && !ch.completed);
    setActiveChallenge(has);
  }, [challenges, username, setActiveChallenge]);

  // 3. applause handler
  const handleApplause = async (user, challenge) => {
    try {
      await axios.put(
        "http://localhost:8080/api/challenges/applause",
        { username: user, challenge }
      );
      fetchChallenges();
    } catch (err) {
      console.error("Error updating applause:", err);
    }
  };

  // 4. start challenge handler
  const handleStartChallenge = async () => {
    if (!username || !newChallenge.challenge || !newChallenge.duration) {
      alert("Please fill all fields and login.");
      return;
    }
    try {
      await axios.post("http://localhost:8080/api/challenges/add", {
        username,
        challenge: newChallenge.challenge,
        duration: newChallenge.duration
      });
      setShowForm(false);
      setNewChallenge({ challenge: "", duration: "" });
      // immediately mark theme active
      setActiveChallenge(true);
      fetchChallenges();
    } catch (err) {
      console.error("Error starting challenge:", err);
    }
  };

  return (
    <Layout>
      <div className="challenge-wrapper">
        {/* Render every challenge */}
        {challenges.map((ch, idx) => (
          <div 
            key={idx} 
            className={`challenge-card${!ch.completed ? ' active' : ''}`}
          >
            <div className="card-content">
              <div className="card-header">
                <span className="user">{ch.username}</span>
                <span className="status">
                  {ch.completed ? "Completed" : "In Progress"}
                </span>
              </div>
              <div className="card-body">
                <p className="card-title">{ch.challenge}</p>
                <p className="card-duration">{ch.duration}</p>
              </div>
              <div className="card-footer">
                <button 
                  onClick={() => handleApplause(ch.username, ch.challenge)}
                >
                  👏 Applause ({ch.applause || 0})
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Button to open start form (disabled if user already has an active) */}
        <button
          className="start-btn"
          onClick={() => setShowForm(!showForm)}
          disabled={activeChallenge}
        >
          {activeChallenge ? "Challenge Active" : "Start Your Challenge"}
        </button>

        {/* New challenge form */}
        {showForm && !activeChallenge && (
          <div className="challenge-form">
            <input
              type="text"
              placeholder="Challenge"
              value={newChallenge.challenge}
              onChange={e =>
                setNewChallenge({ ...newChallenge, challenge: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Duration"
              value={newChallenge.duration}
              onChange={e =>
                setNewChallenge({ ...newChallenge, duration: e.target.value })
              }
            />
            <button className="submit-btn" onClick={handleStartChallenge}>
              Start Challenge
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Challenge;
