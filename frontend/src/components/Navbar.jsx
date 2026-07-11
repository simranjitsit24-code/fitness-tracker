import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            💪 Fitness Tracker
          </Link>

          {user ? (
            <div className="navbar-links">
              <Link to="/" className={isActive('/') ? 'active' : ''}>
                Dashboard
              </Link>
              <Link to="/workouts" className={isActive('/workouts') ? 'active' : ''}>
                Workouts
              </Link>
              <Link to="/add-workout" className={isActive('/add-workout') ? 'active' : ''}>
                + Add
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
              <div className="navbar-profile">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          ) : (
            <div className="navbar-links">
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      {user && (
        <div className="bottom-nav-mobile">
          <div className="nav-items">
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
              <span className="icon">🏠</span>
              <span className="label">Home</span>
            </Link>
            <Link to="/workouts" className={`nav-item ${isActive('/workouts') ? 'active' : ''}`}>
              <span className="icon">💪</span>
              <span className="label">Workouts</span>
            </Link>
            <Link to="/add-workout" className={`nav-item ${isActive('/add-workout') ? 'active' : ''}`}>
              <span className="icon">➕</span>
              <span className="label">Add</span>
            </Link>
            <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none' }}>
              <span className="icon">🚪</span>
              <span className="label">Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;