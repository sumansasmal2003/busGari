import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/poppins';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Hardcoded credentials
  const adminCredentials = [
    { username: 'admin1', password: 'password123' },
    { username: 'admin2', password: 'password456' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the entered credentials match any of the hardcoded credentials
    const isValidAdmin = adminCredentials.some(
      (admin) => admin.username === username && admin.password === password
    );

    if (isValidAdmin) {
      // If valid, redirect to the admin dashboard
      navigate('/admin-dashboard');
    } else {
      // If not valid, show an error message
      setErrorMessage('Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-50 to-blue-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-r from blue-100 to-blue-50 shadow-lg rounded-lg p-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">Admin Login</h2>
          {errorMessage && (
            <p className="text-red-500 text-center mb-4">{errorMessage}</p>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your username"
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg shadow-lg transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-400"
              >
                Login
              </button>
            </div>
          </form>
        </div>
        <div className="mt-4 text-center text-gray-100">
          <p>Powered by <span className="font-semibold">Busgari</span></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
