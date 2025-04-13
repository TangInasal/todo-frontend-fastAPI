import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://todo-backend-fastapiuvicorn-main-app.onrender.com/';

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) setIsDarkMode(JSON.parse(savedMode));
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Fetch tasks based on filter
  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = API_URL;
      if (filter === 'completed') {
        url = `${API_URL}/filter?completed=true`;
      } else if (filter === 'pending') {
        url = `${API_URL}/filter?completed=false`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
    setLoading(false);
  };

  // Fetch tasks when filter changes
  useEffect(() => {
    fetchTasks();
  }, [filter]);

  // Handle form submission for adding or updating tasks
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTask) {
        const response = await fetch(`${API_URL}/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, completed: editingTask.completed }),
        });
        if (!response.ok) throw new Error('Failed to update task');
        setEditingTask(null);
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        if (!response.ok) throw new Error('Failed to add task');
      }
      setTitle('');
      fetchTasks();
    } catch (err) {
      setError('Failed to save task');
    }
    setLoading(false);
  };

  // Toggle task completion
  const handleToggleCompleted = async (task) => {
    try {
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, completed: !task.completed }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      fetchTasks();
    } catch (err) {
      setError('Failed to update task');
    }
  };

  // Start editing a task
  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
  };

  // Delete a task
  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to delete task');
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="todo-container">
        <h1>To-Do List</h1>
        <button
          className="dark-mode-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {editingTask ? 'Update' : 'Add'} Task
          </button>
          {editingTask && (
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setTitle('');
              }}
            >
              Cancel
            </button>
          )}
        </form>
        <div className="filter-buttons">
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'active' : ''}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'active' : ''}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'active' : ''}
          >
            Pending
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span>{task.title}</span>
            <button onClick={() => handleToggleCompleted(task)}>
              {task.completed ? 'Undo' : 'Complete'}
            </button>
            <button onClick={() => handleEdit(task)}>Edit</button>
            <button className="delete-button" onClick={() => handleDelete(task.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;