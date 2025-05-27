import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';
import './index.css';

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menuItems = [
    { path: '/home', name: 'Home' },
    { path: '/videosuggestions', name: 'Video Suggestions' },
    { path: '/todo', name: 'Todo List' },
    { path: '/chatbot', name: 'Chatbot' },
    { path: '/quiz', name: 'Quiz' },
    { path: '/challenge', name: 'Challenge Mode' },
    { path: '/gallery', name: 'Gallery' },
    { path: '/settings', name: 'Settings' },
  ];

  return (
    <div className={`app-container${open ? ' menu-open' : ''}`}>
      {/* Mobile Toggle Button */}
      <button
        className="menu-toggle"
        onClick={() => setOpen(o => !o)}
      >
        ☰
      </button>

      <aside ref={ref} className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="logo">EVOLV</h2>
        </div>

        <nav className="menu-items">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="menu-link"
              onClick={() => setOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location = '/';
            }}
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}