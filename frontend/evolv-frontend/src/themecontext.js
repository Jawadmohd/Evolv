// src/themecontext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext({
  activeChallenge: false,
  setActiveChallenge: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [activeChallenge, setActiveChallenge] = useState(false);
  const username = localStorage.getItem('username');
  const location = useLocation();

  // Re-run on login/logout (username change) or any navigation
  useEffect(() => {
    if (!username) {
      // logged out → ensure theme off
      setActiveChallenge(false);
      return;
    }

    // fetch your challenges and flip theme accordingly
    axios
      .get('http://localhost:8080/api/challenges')
      .then(({ data }) => {
        const has = data.some(ch => ch.username === username && !ch.completed);
        setActiveChallenge(has);
      })
      .catch(err => {
        console.error('Failed fetching challenges for theme:', err);
      });
  }, [username, location.pathname]);

  // keep <body> class in sync
  useEffect(() => {
    document.body.classList.toggle('theme-active', activeChallenge);
  }, [activeChallenge]);

  return (
    <ThemeContext.Provider value={{ activeChallenge, setActiveChallenge }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
