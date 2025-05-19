import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import './settings.css';
// Ensure that requests hit Spring Boot on 8080
axios.defaults.baseURL = 'http://localhost:8080';

const Settings = () => {
  // Username state
  const storedUsername = localStorage.getItem('username') || '';
  const [username, setUsername] = useState(storedUsername);
  const [newUsername, setNewUsername] = useState(storedUsername);
  const [usernamePassword, setUsernamePassword] = useState('');

  // Interests state
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');

  // Password update state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });

  // Fetch interests whenever username changes
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        if (!username) {
          alert('Please login first');
          return;
        }
        const { data } = await axios.get(`/api/settings/interests/${username}`);
        setInterests(data);
      } catch (error) {
        console.error('Error loading interests:', error);
        alert('Failed to load interests');
      }
    };
    fetchInterests();
  }, [username]);

  // Add a new interest
  const handleAddInterest = async (e) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    try {
      const { data } = await axios.post('/api/settings/interests', { username, interest: newInterest });
      setInterests((prev) => [...prev, data]);
      setNewInterest('');
    } catch (error) {
      console.error('Error adding interest:', error);
      alert('Failed to add interest');
    }
  };

  // Delete an interest
  const handleDeleteInterest = async (id) => {
    try {
      await axios.delete(`/api/settings/interests/${id}`);
      setInterests((prev) => prev.filter((i) => (i._id || i.id) !== id));
    } catch (error) {
      console.error('Error deleting interest:', error);
      alert('Failed to delete interest');
    }
  };

  // Update username
  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/settings/username', {
        currentUsername: username,
        newUsername,
        currentPassword: usernamePassword
      });
      localStorage.setItem('username', newUsername);
      setUsername(newUsername);
      setUsernamePassword('');
      alert('Username updated successfully!');
    } catch (error) {
      console.error('Error updating username:', error);
      if (error.response?.status === 401) {
        alert('Incorrect password. Please try again.');
      } else {
        alert('Error updating username');
      }
    }
  };

  // Update password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/settings/password', {
        username,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      alert('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response?.status === 401) {
        alert('Incorrect current password.');
      } else {
        alert('Error updating password');
      }
    }
  };

  return (
    <Layout>
      <div className="settings-container">
        <h1>Settings for {username}</h1>

        {/* Username Update Section */}
        <section className="username-update">
          <h2>Change Username</h2>
          <form onSubmit={handleUsernameUpdate}>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="New username"
              required
            />
            <input
              type="password"
              value={usernamePassword}
              onChange={(e) => setUsernamePassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
            <button type="submit">Update Username</button>
          </form>
        </section>

        {/* Password Update Section */}
        <section className="password-update">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordUpdate}>
            <input
              type="password"
              placeholder="Current password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              required
            />
            <button type="submit">Update Password</button>
          </form>
        </section>

        {/* Interests Management Section */}
        <section className="interests-update">
          <h2>Manage Interests</h2>
          <form onSubmit={handleAddInterest} className="add-interest-form">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add new interest"
              required
            />
            <button type="submit">Add Interest</button>
          </form>
          <ul className="interests-list">
            {interests.map((interest) => (
              <li key={interest._id || interest.id}>
                {interest.interest}
                <button
                  onClick={() => handleDeleteInterest(interest._id || interest.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  );
};

export default Settings;