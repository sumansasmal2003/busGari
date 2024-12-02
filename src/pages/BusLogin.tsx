import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { auth, db } from '../firebaseConfig'; // Ensure db is imported correctly
import '@fontsource/poppins';

const BusLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Sign in the user
      await signInWithEmailAndPassword(auth, email, password);

      // Fetch the bus data to find the bus with the matching email
      const busesRef = ref(db, 'buses');
      const emailQuery = query(busesRef, orderByChild('email'), equalTo(email));
      const snapshot = await get(emailQuery);

      if (snapshot.exists()) {
        const busData = snapshot.val();
        const busId = Object.keys(busData)[0]; // Get the first matching bus ID

        if (busId) {
          // Redirect to the dashboard with the bus ID in the URL
          navigate(`/bus-dashboard/${busId}`);
        } else {
          setError('Bus ID not found for this email.');
        }
      } else {
        setError('No bus found with the provided email.');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <section className="h-screen flex justify-center items-center bg-gradient-to-r from-blue-50 to-blue-200" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-bold mb-6 text-center">Bus Operator Login</h3>
        <form onSubmit={handleLogin}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
            <input 
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
            <input 
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
          >
            Login
          </button>
        </form>
      </div>
    </section>
  );
};

export default BusLogin;
