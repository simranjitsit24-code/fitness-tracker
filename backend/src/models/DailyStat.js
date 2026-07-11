import mongoose from 'mongoose';

const DailyStatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  steps: {
    type: Number,
    default: 0
  },
  calories: {
    type: Number,
    default: 0
  },
  activeMinutes: {
    type: Number,
    default: 0
  },
  sleepQuality: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  sleepStages: {
    awake: { type: Number, default: 0 },
    light: { type: Number, default: 0 },
    deep: { type: Number, default: 0 },
    rem: { type: Number, default: 0 }
  }
});

DailyStatSchema.index({ user: 1, date: -1 }, { unique: true });

export default mongoose.model('DailyStat', DailyStatSchema);