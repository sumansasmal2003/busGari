// src/pages/MainPage.tsx
import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import SearchSection from '../components/SearchSection';

// Adding a beautiful font via Google Fonts
import '@fontsource/poppins'; // Example: Poppins font
import FeedbackSection from '../components/FeedbackSection';
// You can also use '@fontsource/lora', '@fontsource/merriweather', etc.

const MainPage: React.FC = () => {
  return (
    <div 
      className="font-poppins text-gray-900 min-h-screen"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <main>
        <HeroSection />
        <FeedbackSection />
        <FeaturesSection />
        <SearchSection />
      </main>
    </div>
  );
};

export default MainPage;
