// filepath: c:\Users\DELL\OneDrive\Desktop\loasAndfound\lost-and-found-react-css\src\pages\AdminLogin.js

import React, { useState } from 'react';
import { useAuth } from '../AuthContext'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './AdminLogin.css'; // Import the CSS file for styling

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Get the login function from AuthContext
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'Admin' && password === 'admin123') { // Replace 'yourPassword' with the actual password
      const userData = {
        id: '123',
        name: username,
        isAdmin: true,
      };
      login(userData); // Call login function from context
      navigate('/admin'); // Redirect to admin dashboard
    } else {
      alert('Invalid credentials'); // Handle invalid login
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Admin Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;