// src/pages/Settings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';

const Settings = () => {
  const [currentUser, setCurrentUser] = useState({});
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const [usernameForm, setUsernameForm] = useState({
    currentUsername: '',
    currentPassword: '',
    newUsername: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    username: '',
    currentPassword: '',
    newPassword: ''
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user (you might need to adjust this based on your auth system)
        const userResponse = await axios.get('/api/current-user');
        setCurrentUser(userResponse.data);
        
        // Get existing interests
        const interestsResponse = await axios.get(`/api/settings/interests/${userResponse.data.username}`);
        setInterests(interestsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Handle interest deletion
  const handleDeleteInterest = async (id) => {
    try {
      await axios.delete(`/api/settings/interests/${id}`);
      setInterests(interests.filter(interest => interest.id !== id));
    } catch (error) {
      console.error('Error deleting interest:', error);
    }
  };

  // Handle new interest addition
  const handleAddInterest = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/settings/interests', {
        username: currentUser.username,
        interest: newInterest
      });
      setInterests([...interests, response.data]);
      setNewInterest('');
    } catch (error) {
      console.error('Error adding interest:', error);
    }
  };

  // Handle username update
  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/settings/username', usernameForm);
      // Update current user in state/local storage
      setCurrentUser({ ...currentUser, username: usernameForm.newUsername });
      alert('Username updated successfully!');
    } catch (error) {
      console.error('Error updating username:', error);
      alert(error.response?.data || 'Error updating username');
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/settings/password', passwordForm);
      alert('Password updated successfully!');
      setPasswordForm({
        username: currentUser.username,
        currentPassword: '',
        newPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      alert(error.response?.data || 'Error updating password');
    }
  };

  return (
    <Layout>
      <div className="settings-container">
        <h1>Settings</h1>
        
        {/* Content Preferences Section */}
        <section className="content-preferences">
          <h2>Content Preferences</h2>
          <div className="current-interests">
            <h3>Current Interests:</h3>
            {interests.map(interest => (
              <div key={interest.id} className="interest-item">
                <span>{interest.interest}</span>
                <button 
                  onClick={() => handleDeleteInterest(interest.id)}
                  className="delete-button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
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
        </section>

        {/* Account Settings Section */}
        <section className="account-settings">
          <h2>Account Settings</h2>
          
          {/* Username Update Form */}
          <form onSubmit={handleUsernameUpdate} className="username-form">
            <h3>Change Username</h3>
            <input
              type="text"
              placeholder="Current username"
              value={usernameForm.currentUsername}
              onChange={(e) => setUsernameForm({
                ...usernameForm,
                currentUsername: e.target.value
              })}
              required
            />
            <input
              type="password"
              placeholder="Current password"
              value={usernameForm.currentPassword}
              onChange={(e) => setUsernameForm({
                ...usernameForm,
                currentPassword: e.target.value
              })}
              required
            />
            <input
              type="text"
              placeholder="New username"
              value={usernameForm.newUsername}
              onChange={(e) => setUsernameForm({
                ...usernameForm,
                newUsername: e.target.value
              })}
              required
            />
            <button type="submit">Update Username</button>
          </form>

          {/* Password Update Form */}
          <form onSubmit={handlePasswordUpdate} className="password-form">
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="Current password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({
                ...passwordForm,
                currentPassword: e.target.value
              })}
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({
                ...passwordForm,
                newPassword: e.target.value
              })}
              required
            />
            <button type="submit">Update Password</button>
          </form>
        </section>
      </div>
    </Layout>
  );
};

export default Settings;