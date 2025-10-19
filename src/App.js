import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import ReportForm from './pages/ReportForm';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import RequireAdmin from './RequireAdmin'; // Import the RequireAdmin component

// Import the CSS file (only needed once, here)
import './index.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Find & Return Logo" className="logo" />
          Find & Return {/* Updated title */}
        </Link>
        <div className="navbar-links">
          <Link to="/report" className="nav-button">
            Report Lost Item
          </Link>
          <Link to="/admin" className="nav-link">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;