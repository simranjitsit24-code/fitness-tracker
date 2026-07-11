import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sets: {
    type: Number,
    required: true
  },
  reps: {
    type: Number,
    required: true
  }
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Pilates', 'Other', 'Steps']
  },
  duration: {
    type: Number,
    default: 0
  },
  intensity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  exercises: [exerciseSchema],
  notes: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  steps: {
    type: Number,
    default: 0
  },
  calories: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Workout', workoutSchema);