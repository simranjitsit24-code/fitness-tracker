import Workout from '../models/Workout.js';
import DailyStat from '../models/DailyStat.js';

// Add workout
export const addWorkout = async (req, res) => {
  try {
    const { type, name, sets, reps, weight, distance, duration, calories, intensity, date } = req.body;
    
    const workout = new Workout({
      user: req.user._id,
      type,
      name,
      sets: type === 'strength' ? sets : 0,
      reps: type === 'strength' ? reps : 0,
      weight: type === 'strength' ? weight : 0,
      distance: type === 'cardio' ? distance : 0,
      duration: type === 'cardio' ? duration : 0,
      calories,
      intensity,
      date: date || new Date()
    });

    await workout.save();

    // Update daily stats
    const startOfDay = new Date(workout.date);
    startOfDay.setHours(0, 0, 0, 0);
    let dailyStat = await DailyStat.findOne({ user: req.user._id, date: startOfDay });
    
    if (!dailyStat) {
      dailyStat = new DailyStat({ user: req.user._id, date: startOfDay });
    }
    
    dailyStat.calories += calories || 0;
    dailyStat.activeMinutes += duration || 0;
    await dailyStat.save();

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get workouts for date range
export const getWorkouts = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? new Date(start) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = end ? new Date(end) : new Date();

    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get workouts for specific date
export const getWorkoutsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: targetDate, $lt: nextDate }
    }).sort({ createdAt: -1 });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete workout
export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await workout.deleteOne();
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add steps
export const addSteps = async (req, res) => {
  try {
    const { steps, date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    let dailyStat = await DailyStat.findOne({ user: req.user._id, date: targetDate });
    if (!dailyStat) {
      dailyStat = new DailyStat({ user: req.user._id, date: targetDate, steps: 0 });
    }
    
    dailyStat.steps += parseInt(steps);
    await dailyStat.save();

    res.json(dailyStat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get daily stats
export const getDailyStats = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const dailyStat = await DailyStat.findOne({ user: req.user._id, date: targetDate });
    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: targetDate, $lt: nextDate }
    });

    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    res.json({
      steps: dailyStat?.steps || 0,
      calories: totalCalories || dailyStat?.calories || 0,
      workouts: workouts.length,
      activeMinutes: totalDuration || dailyStat?.activeMinutes || 0,
      sleepQuality: dailyStat?.sleepQuality || 0,
      sleepStages: dailyStat?.sleepStages || { awake: 0, light: 0, deep: 0, rem: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get weekly stats for chart
export const getWeeklyStats = async (req, res) => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: startDate }
    });

    const dailyStats = await DailyStat.find({
      user: req.user._id,
      date: { $gte: startDate }
    });

    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayWorkouts = workouts.filter(w => {
        const wDate = new Date(w.date);
        wDate.setHours(0, 0, 0, 0);
        return wDate.getTime() === date.getTime();
      });

      const dayStat = dailyStats.find(d => {
        const dDate = new Date(d.date);
        dDate.setHours(0, 0, 0, 0);
        return dDate.getTime() === date.getTime();
      });

      weeklyData.unshift({
        date: date.toISOString().split('T')[0],
        workouts: dayWorkouts.length,
        steps: dayStat?.steps || 0,
        calories: dayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0)
      });
    }

    res.json(weeklyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};