import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../firebaseConfig';
import { FaStar } from 'react-icons/fa';

import '@fontsource/poppins';

const Feedback: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() === '' || feedbackText.trim() === '' || rating === 0) {
      setError('Please fill in all fields and provide a rating.');
      return;
    }

    try {
      const feedbackRef = ref(db, 'feedback');
      await push(feedbackRef, {
        name,
        feedbackText,
        rating,
        timestamp: new Date().toISOString(),
      });

      setSuccess('Feedback submitted successfully!');
      setName('');
      setFeedbackText('');
      setRating(0);
    } catch (err) {
      setError('Error submitting feedback.');
      console.error('Feedback error:', err);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  return (
    <section className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="container mx-auto bg-gradient-to-r from-blue-100 to-blue-50 p-8 rounded-lg shadow-md max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Feedback Form</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md border-none outline-none"
              required
            />
          </div>

          {/* Feedback Text Input */}
          <div className="mb-4">
            <label htmlFor="feedbackText" className="block text-gray-700 font-medium mb-2">Feedback</label>
            <textarea
              id="feedbackText"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md border-none outline-none"
              required
            />
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Rating</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  title='star'
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </section>
  );
};

export default Feedback;
