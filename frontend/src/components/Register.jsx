import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password validation functions
  const validatePassword = (pass) => {
    const errors = [];
    
    if (pass.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Za-z]/.test(pass)) {
      errors.push('At least one alphabet');
    }
    if (!/\d/.test(pass)) {
      errors.push('At least one digit');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      errors.push('At least one special character (!@#$%^&* etc.)');
    }
    
    return errors;
  };

  const isPasswordValid = (pass) => {
    return pass.length >= 8 && 
           /[A-Za-z]/.test(pass) && 
           /\d/.test(pass) && 
           /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  };

  const passwordErrors = validatePassword(password);
  const isValid = isPasswordValid(password);
  const doPasswordsMatch = password === confirmPassword && password !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password before submitting
    if (!isValid) {
      setError('Please meet all password requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (!password) return 'bg-gray-200';
    if (!isValid) return 'bg-red-500';
    return 'bg-green-500';
  };

  // Get password strength percentage
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Za-z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 25;
    return score;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Create Account</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-900 font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-900 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-900 font-medium mb-2">
              Password <span className="text-sm text-gray-500">(8+ chars, 1 letter, 1 number, 1 special)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 pr-10 text-gray-900 bg-white ${
                  password && !isValid ? 'border-red-500' : 
                  password && isValid ? 'border-green-500' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password strength bar */}
            {password && (
              <div className="mt-2">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${getPasswordStrength()}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Password strength: {getPasswordStrength() === 100 ? 'Strong 💪' : 
                                    getPasswordStrength() >= 75 ? 'Good' : 
                                    getPasswordStrength() >= 50 ? 'Fair' : 'Weak'}
                </p>
              </div>
            )}

            {/* Password requirements list */}
            <div className="mt-2 space-y-1">
              <p className={`text-sm ${password.length >= 8 ? 'text-green-600' : 'text-red-500'}`}>
                {password.length >= 8 ? '✅' : '❌'} At least 8 characters
              </p>
              <p className={`text-sm ${/[A-Za-z]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
                {/[A-Za-z]/.test(password) ? '✅' : '❌'} At least one alphabet
              </p>
              <p className={`text-sm ${/\d/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
                {/\d/.test(password) ? '✅' : '❌'} At least one digit
              </p>
              <p className={`text-sm ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
                {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✅' : '❌'} At least one special character (!@#$%^&* etc.)
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-900 font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 pr-10 text-gray-900 bg-white ${
                  confirmPassword && !doPasswordsMatch ? 'border-red-500' : 
                  confirmPassword && doPasswordsMatch ? 'border-green-500' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && doPasswordsMatch && (
              <p className="text-green-600 text-sm mt-1">✅ Passwords match</p>
            )}
            {confirmPassword && !doPasswordsMatch && (
              <p className="text-red-500 text-sm mt-1">❌ Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isValid || (confirmPassword && !doPasswordsMatch)}
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-900">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
