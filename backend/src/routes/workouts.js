import express from 'express';
import jwt from 'jsonwebtoken';
import Workout from '../models/Workout.js';

const router = express.Router();

// Middleware to verify token
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get workouts for a date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const workouts = await Workout.find({
      user: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: -1 });

    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get daily stats
router.get('/daily', auth, async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const workouts = await Workout.find({
      user: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const stats = {
      steps: 0,
      calories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
      workouts: workouts.length,
      activeMinutes: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      sleepQuality: 0,
      sleepStages: { awake: 0, light: 0, deep: 0, rem: 0 }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get weekly data
router.get('/weekly', auth, async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const workouts = await Workout.find({
      user: req.userId,
      date: { $gte: weekAgo, $lte: today }
    }).sort({ date: 1 });

    const weeklyData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      
      const dayWorkouts = workouts.filter(w => 
        new Date(w.date).toISOString().split('T')[0] === dayStr
      );
      
      weeklyData.unshift({
        day: days[date.getDay()],
        date: dayStr,
        duration: dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        count: dayWorkouts.length
      });
    }

    res.json(weeklyData);
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create workout
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating workout:', req.body);
    
    const workout = new Workout({
      ...req.body,
      user: req.userId
    });
    
    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;