import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import WorkoutForm from './components/WorkoutForm';
import WorkoutList from './components/WorkoutList';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <Router>
          <div className="fitness-app">
            <div className="glow-top"></div>
            <Navbar />
            <div className="scrollable-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/add-workout" element={
                  <ProtectedRoute>
                    <WorkoutForm />
                  </ProtectedRoute>
                } />
                <Route path="/edit-workout/:id" element={
                  <ProtectedRoute>
                    <WorkoutForm />
                  </ProtectedRoute>
                } />
                <Route path="/workouts" element={
                  <ProtectedRoute>
                    <WorkoutList />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </div>
        </Router>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;