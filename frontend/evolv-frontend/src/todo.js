import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Layout from './Layout';
import './todo.css'; // Using unified styles

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [period, setPeriod] = useState('onetime');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      const fetchTasks = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`http://localhost:8080/api/tasks?username=${username}`);
          setTasks(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch tasks');
        }
        setLoading(false);
      };
      fetchTasks();
    }
  }, [username]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!username) {
      navigate('/');
      return;
    }
    if (!newTask.trim()) {
      setError('Please enter a task description');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:8080/api/tasks?username=${username}`, {
        title: newTask,
        period: period.toLowerCase()
      });
      setTasks([...tasks, response.data]);
      setNewTask('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task');
    }
    setLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/tasks/${taskId}?username=${username}`);
      setTasks(tasks.filter(t => (t._id || t.id) !== taskId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <Layout>
      <div className="main-content">
        <header className="header">
          <h1 className="page-title">{username}'s ToDo List</h1>
        </header>

        <div className="task-list card">
          {loading ? (
            <div className="loading-text">Loading tasks...</div>
          ) : (
            tasks.map(task => (
              <div key={task._id || task.id} className="task-item">
                <div className="task-content">
                  <span>{task.title}</span>
                  <span className={`task-type ${task.period}`}>{task.period}</span>
                </div>
                {task.period === 'onetime' && (
                  <button 
                    onClick={() => handleDeleteTask(task._id || task.id)} 
                    className="delete-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          )}
          {!loading && tasks.length === 0 && (
            <div className="empty-state">No tasks found. Add your first task!</div>
          )}
        </div>

        <form onSubmit={handleAddTask} className="task-form card">
          <div className="input-group">
            <label>New Task</label>
            <input 
              type="text" 
              value={newTask} 
              onChange={e => { 
                setNewTask(e.target.value); 
                setError(''); 
              }} 
              placeholder="Enter task description" 
            />
          </div>
          <div className="input-group">
            <label>Task Type</label>
            <select 
              value={period} 
              onChange={e => setPeriod(e.target.value)}
            >
              <option value="onetime">Onetime</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn"
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>
    </Layout>
  );
};

export default TodoList;