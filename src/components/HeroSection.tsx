import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-24">
      <div className="container mx-auto flex flex-col items-center text-center px-6">
        {/* Heading */}
        <h2 className="text-5xl font-semibold text-blue-800 mb-6 leading-tight tracking-tight">
          Welcome to Busgari – Your Trusted Bus Search Solution
        </h2>
        {/* Subheading */}
        <p className="text-base text-gray-500 mb-10 max-w-3xl mx-auto leading-relaxed">
          At Busgari, we simplify the way you search for bus routes, schedules, and availability. 
          With our sophisticated platform, you can explore multiple routes, compare schedules, and find the best option for your travel needs.
          Whether you're planning a short trip or a long-distance journey, Busgari ensures you find the most reliable and up-to-date information.
        </p>
        <p className="text-base text-gray-500 mb-10 max-w-3xl mx-auto leading-relaxed">
          Our platform offers real-time data and a wide network of bus operators, giving you access to the most accurate and current travel details. 
          Say goodbye to the frustration of juggling different sources for route information – Busgari streamlines everything in one place, so you can focus on planning your trip with ease.
        </p>
        <p className="text-base text-gray-500 mb-10 max-w-3xl mx-auto leading-relaxed">
          Designed for frequent travelers, tourists, and everyday commuters, Busgari is your go-to solution for efficient and hassle-free bus travel. 
          With our easy-to-use platform, you can quickly find the best travel options and book tickets in just a few clicks.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
