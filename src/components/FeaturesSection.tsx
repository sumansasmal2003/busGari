import React from 'react';

const features = [
  { title: "Real-Time Tracking", description: "Track buses in real-time to know their exact location." },
  { title: "Route Information", description: "Get detailed route information and schedules." },
  { title: "Bus Name Search", description: "Find buses by their specific name." },
  { title: "Route Wise Search", description: "Search buses based on start and destination points." },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="container mx-auto px-6 lg:px-12">
        <h3 className="text-4xl font-semibold text-gray-800 text-center mb-16 tracking-tight">
          Our Key Features
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-100 to-blue-50 p-8 shadow-lg rounded-xl border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-2xl duration-300"
            >
              <h4 className="text-xl font-semibold text-blue-700 mb-3 tracking-wide">
                {feature.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
