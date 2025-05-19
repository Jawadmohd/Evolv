import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TodoPreview = ({ username = localStorage.getItem('username') }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/tasks?username=${username}`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setTasks(data);
      })
      .catch(() => setTasks([]));
  }, [username]);

  return (
    <div className="preview-box">
      {tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <ul>
          {tasks.slice(0, 3).map((t, i) => (
            <li key={i}>{t.title || t.task || 'Untitled Task'}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoPreview;
