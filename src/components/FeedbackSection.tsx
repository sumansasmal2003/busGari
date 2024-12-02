import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebaseConfig';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';

interface Feedback {
  name: string;
  feedbackText: string;
  rating: number;
  timestamp: string;
}

const FeedbackSection: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const feedbackRef = ref(db, 'feedback');

    const fetchFeedbacks = () => {
      onValue(feedbackRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const feedbackList: Feedback[] = Object.keys(data).map(key => ({
            ...data[key],
            timestamp: key // Assuming the key is used as the timestamp
          }));
          setFeedbacks(feedbackList);
        } else {
          setFeedbacks([]);
        }
      }, (err) => {
        setError('Failed to fetch feedback. Please try again later.');
        console.error('Fetch error:', err);
      });
    };

    fetchFeedbacks();

    // Cleanup function
    return () => {
      // Perform any necessary cleanup if needed
    };
  }, []);

  if (error) {
    return <p className="text-red-500 text-center p-4">{error}</p>;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-100 to-blue-50">
      <div className="container mx-auto bg-gradient-to-r from-blue-50 to-blue-100 p-6 md:p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-gray-800">User Feedback</h1>

        {feedbacks.length === 0 ? (
          <p className="text-center text-gray-500">No feedback available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.timestamp}
                className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 transition-transform transform hover:shadow-lg duration-200"
              >
                <div className="flex items-center justify-center mb-4 text-blue-600">
                  <FaQuoteLeft className="text-2xl sm:text-3xl mr-2" />
                  <FaQuoteRight className="text-2xl sm:text-3xl ml-2" />
                </div>
                <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                  {feedback.feedbackText}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800 text-sm sm:text-base">{feedback.name}</span>
                  <div className="flex items-center">
                    {[...Array(feedback.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2l2.828 5.828L22 9.828l-4.828 4.828L18 22l-6-3.142L6 22l1.828-7.344L2 9.828l7.172-1.172L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeedbackSection;
