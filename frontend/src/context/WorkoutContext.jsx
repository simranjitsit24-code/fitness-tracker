import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [dailyStats, setDailyStats] = useState({
    steps: 0,
    calories: 0,
    workouts: 0,
    activeMinutes: 0,
    sleepQuality: 0,
    sleepStages: { awake: 0, light: 0, deep: 0, rem: 0 }
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const fetchWorkouts = useCallback(async (date) => {
    if (!user) return;
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      console.log('Fetching workouts for date:', dateStr);
      
      // Use the api instance which already has the baseURL and auth header
      const [workoutsRes, statsRes, weeklyRes] = await Promise.all([
        api.get(`/workouts/date/${dateStr}`),
        api.get(`/workouts/daily?date=${dateStr}`),
        api.get('/workouts/weekly')
      ]);
      
      console.log('Workouts response:', workoutsRes.data);
      console.log('Stats response:', statsRes.data);
      console.log('Weekly response:', weeklyRes.data);
      
      setWorkouts(workoutsRes.data);
      setDailyStats(statsRes.data);
      setWeeklyData(weeklyRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWorkouts(selectedDate);
    }
  }, [user, selectedDate, fetchWorkouts]);

  const addWorkout = async (workoutData) => {
    try {
      console.log('Adding workout:', workoutData);
      const { data } = await api.post('/workouts', workoutData);
      toast.success('Workout logged! 💪');
      fetchWorkouts(selectedDate);
      return data;
    } catch (error) {
      console.error('Error adding workout:', error);
      toast.error(error.response?.data?.message || 'Failed to add workout');
      throw error;
    }
  };

  const deleteWorkout = async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      toast.success('Workout deleted');
      fetchWorkouts(selectedDate);
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  const addSteps = async (steps) => {
    try {
      await api.post('/workouts/steps', { steps });
      toast.success(`+${steps} steps added! 🚶`);
      fetchWorkouts(selectedDate);
    } catch (error) {
      console.error('Error adding steps:', error);
      toast.error('Failed to add steps');
    }
  };

  return (
    <WorkoutContext.Provider value={{
      workouts,
      dailyStats,
      weeklyData,
      selectedDate,
      setSelectedDate,
      loading,
      fetchWorkouts,
      addWorkout,
      deleteWorkout,
      addSteps
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkouts = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  return context;
};