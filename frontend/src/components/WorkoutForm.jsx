import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';

const WorkoutForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addWorkout, updateWorkout, getWorkout, loading } = useWorkouts();
  
  const [formData, setFormData] = useState({
    type: '',
    duration: '',
    intensity: 'Medium',
    exercises: [],
    notes: '',
    date: new Date().toISOString().split('T')[0],
    rating: 3
  });

  const [exerciseName, setExerciseName] = useState('');
  const [exerciseSets, setExerciseSets] = useState('');
  const [exerciseReps, setExerciseReps] = useState('');

  useEffect(() => {
    if (id) {
      const workout = getWorkout(id);
      if (workout) {
        setFormData({
          type: workout.type || '',
          duration: workout.duration || '',
          intensity: workout.intensity || 'Medium',
          exercises: workout.exercises || [],
          notes: workout.notes || '',
          date: workout.date ? new Date(workout.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          rating: workout.rating || 3
        });
      }
    }
  }, [id, getWorkout]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addExercise = () => {
    if (exerciseName && exerciseSets && exerciseReps) {
      setFormData({
        ...formData,
        exercises: [...formData.exercises, {
          name: exerciseName,
          sets: parseInt(exerciseSets),
          reps: parseInt(exerciseReps)
        }]
      });
      setExerciseName('');
      setExerciseSets('');
      setExerciseReps('');
    }
  };

  const removeExercise = (index) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const workoutData = {
      ...formData,
      duration: parseInt(formData.duration),
      rating: parseInt(formData.rating),
      date: new Date(formData.date).toISOString()
    };

    if (id) {
      await updateWorkout(id, workoutData);
    } else {
      await addWorkout(workoutData);
    }
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        {id ? 'Edit Workout' : 'Add New Workout'}
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Workout Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Type</option>
              <option value="Cardio">Cardio</option>
              <option value="Strength">Strength</option>
              <option value="Yoga">Yoga</option>
              <option value="HIIT">HIIT</option>
              <option value="Pilates">Pilates</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Intensity
            </label>
            <select
              name="intensity"
              value={formData.intensity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-gray-700 font-medium mb-2">
            Exercises
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Exercise name"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Sets"
              value={exerciseSets}
              onChange={(e) => setExerciseSets(e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Reps"
              value={exerciseReps}
              onChange={(e) => setExerciseReps(e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addExercise}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          
          {formData.exercises.length > 0 && (
            <div className="bg-gray-50 rounded p-3">
              {formData.exercises.map((exercise, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span>
                    <strong>{exercise.name}</strong> - {exercise.sets} sets × {exercise.reps} reps
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-gray-700 font-medium mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="How did it go? Any observations?"
          />
        </div>

        <div className="mt-6">
          <label className="block text-gray-700 font-medium mb-2">
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({...formData, rating: star})}
                className={`text-2xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update Workout' : 'Add Workout'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutForm; // <-- MAKE SURE THIS IS AT THE END