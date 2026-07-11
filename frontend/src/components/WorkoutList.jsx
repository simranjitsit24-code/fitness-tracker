import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';

const WorkoutList = () => {
  const { workouts, deleteWorkout, loading } = useWorkouts();
  const [filter, setFilter] = useState('all');

  const filteredWorkouts = filter === 'all' 
    ? workouts 
    : workouts.filter(w => w.type === filter);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      await deleteWorkout(id);
    }
  };

  const getIntensityColor = (intensity) => {
    switch(intensity?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading workouts...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Workouts</h1>
        <Link
          to="/add-workout"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add Workout
        </Link>
      </div>

      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('Cardio')}
          className={`px-4 py-2 rounded ${
            filter === 'Cardio' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Cardio
        </button>
        <button
          onClick={() => setFilter('Strength')}
          className={`px-4 py-2 rounded ${
            filter === 'Strength' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Strength
        </button>
        <button
          onClick={() => setFilter('Yoga')}
          className={`px-4 py-2 rounded ${
            filter === 'Yoga' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Yoga
        </button>
        <button
          onClick={() => setFilter('HIIT')}
          className={`px-4 py-2 rounded ${
            filter === 'HIIT' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          HIIT
        </button>
      </div>

      {filteredWorkouts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No workouts found.</p>
          <p className="text-gray-400">Start by adding your first workout!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredWorkouts.map((workout) => (
            <div key={workout._id || workout.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold">{workout.type}</h3>
                  <p className="text-gray-500 text-sm">
                    {new Date(workout.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIntensityColor(workout.intensity)}`}>
                  {workout.intensity}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-gray-700">
                  <span className="font-medium">Duration:</span> {workout.duration} min
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Rating:</span> {'⭐'.repeat(workout.rating)}
                </p>
              </div>

              {workout.exercises && workout.exercises.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium text-gray-700">Exercises:</p>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {workout.exercises.map((exercise, index) => (
                      <li key={index}>
                        {exercise.name} - {exercise.sets} sets × {exercise.reps} reps
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {workout.notes && (
                <p className="text-gray-600 text-sm italic mb-3">"{workout.notes}"</p>
              )}

              <div className="flex gap-2 mt-4">
                <Link
                  to={`/edit-workout/${workout._id || workout.id}`}
                  className="flex-1 bg-yellow-500 text-white text-center px-4 py-2 rounded hover:bg-yellow-600 transition"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(workout._id || workout.id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutList;