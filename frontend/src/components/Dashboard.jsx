import React, { useState, useEffect } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { workouts, fetchWorkouts, loading } = useWorkouts();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalExercises: 0,
    totalDuration: 0,
    averageRating: 0,
    weeklyProgress: 0,
    bestWorkoutType: 'N/A',
    streakDays: 0
  });

  useEffect(() => {
    fetchWorkouts(new Date());
  }, [fetchWorkouts]);

  useEffect(() => {
    if (workouts.length > 0) {
      const totalWorkouts = workouts.length;
      const totalExercises = workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0);
      const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      const averageRating = workouts.reduce((sum, w) => sum + (w.rating || 0), 0) / totalWorkouts;

      const typeCount = {};
      workouts.forEach(w => {
        typeCount[w.type] = (typeCount[w.type] || 0) + 1;
      });
      const bestWorkoutType = Object.keys(typeCount).length > 0 
        ? Object.keys(typeCount).reduce((a, b) => typeCount[a] > typeCount[b] ? a : b, '')
        : 'N/A';

      const today = new Date();
      const last7Days = workouts.filter(w => {
        const date = new Date(w.date);
        const diff = (today - date) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      });
      const previous7Days = workouts.filter(w => {
        const date = new Date(w.date);
        const diff = (today - date) / (1000 * 60 * 60 * 24);
        return diff > 7 && diff <= 14;
      });
      
      const weeklyProgress = previous7Days.length > 0 
        ? ((last7Days.length - previous7Days.length) / previous7Days.length * 100).toFixed(1)
        : last7Days.length > 0 ? 100 : 0;

      setStats({
        totalWorkouts,
        totalExercises,
        totalDuration,
        averageRating: averageRating.toFixed(1),
        weeklyProgress,
        bestWorkoutType,
        streakDays: calculateStreak(workouts)
      });
    }
  }, [workouts]);

  const calculateStreak = (workouts) => {
    if (workouts.length === 0) return 0;
    
    const dates = workouts.map(w => new Date(w.date).toDateString());
    const uniqueDates = [...new Set(dates)].sort();
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
      return 0;
    }
    
    let currentDate = new Date();
    while (true) {
      const dateStr = currentDate.toDateString();
      if (uniqueDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const durationChartData = {
    labels: workouts.map(w => new Date(w.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Duration (mins)',
        data: workouts.map(w => w.duration),
        borderColor: '#4A6CF7',
        backgroundColor: 'rgba(74, 108, 247, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const typeDistribution = {};
  workouts.forEach(w => {
    typeDistribution[w.type] = (typeDistribution[w.type] || 0) + 1;
  });

  const doughnutData = {
    labels: Object.keys(typeDistribution),
    datasets: [
      {
        data: Object.values(typeDistribution),
        backgroundColor: [
          'rgba(74, 108, 247, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          '#4A6CF7',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#7C3AED',
          '#EC4899',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#CBD5E1',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94A3B8' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#94A3B8' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#CBD5E1',
          padding: 15,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-400">Loading your fitness data...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome, <span className="text-gradient">{user?.name || 'User'}</span>! 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's your fitness overview</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="label">Total Workouts</div>
          <div className="value">{stats.totalWorkouts}</div>
          <div className="sub-text">🏋️ All time</div>
        </div>
        <div className="stat-card green">
          <div className="label">Total Duration</div>
          <div className="value">{stats.totalDuration}<span className="unit">min</span></div>
          <div className="sub-text">⏱️ Active time</div>
        </div>
        <div className="stat-card orange">
          <div className="label">Average Rating</div>
          <div className="value">{stats.averageRating}<span className="unit">⭐</span></div>
          <div className="sub-text">📊 Overall</div>
        </div>
        <div className="stat-card purple">
          <div className="label">Current Streak</div>
          <div className="value">{stats.streakDays}<span className="unit">🔥</span></div>
          <div className="sub-text">📅 Days in a row</div>
        </div>
        <div className="stat-card">
          <div className="label">Best Type</div>
          <div className="value" style={{ fontSize: '20px' }}>{stats.bestWorkoutType}</div>
          <div className="sub-text">🏆 Most frequent</div>
        </div>
        <div className="stat-card">
          <div className="label">Weekly Progress</div>
          <div className={`value ${stats.weeklyProgress >= 0 ? 'text-green-500' : 'text-red-500'}`} style={{ fontSize: '20px' }}>
            {stats.weeklyProgress >= 0 ? '+' : ''}{stats.weeklyProgress}%
          </div>
          <div className="sub-text">📈 vs last week</div>
        </div>
      </div>

      {/* Charts */}
      {workouts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="chart-container">
            <h3>Duration Trend</h3>
            <div className="chart-wrapper">
              <Line data={durationChartData} options={chartOptions} />
            </div>
          </div>
          <div className="chart-container">
            <h3>Workout Distribution</h3>
            <div className="chart-wrapper">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="icon">🏋️</div>
          <h3>No Workouts Recorded Yet</h3>
          <p>Start your fitness journey by adding your first workout!</p>
          <a href="/add-workout" className="btn-primary">
            Add Your First Workout
          </a>
        </div>
      )}
    </>
  );
};

export default Dashboard;