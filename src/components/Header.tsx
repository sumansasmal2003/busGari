import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '@fontsource/poppins'; 

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav 
      className="bg-white bg-opacity-10 backdrop-blur-md text-gray-800 p-4 shadow-lg sticky top-0 z-50"
      style={{ fontFamily: "'Poppins', sans-serif" }}  
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">BusGari</div>
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-blue-500 hover:underline">Home</Link>
          <Link to="/bus-register" className="hover:text-blue-500 hover:underline">Register Bus</Link>
          <Link to="/bus-login" className="hover:text-blue-500 hover:underline">Bus Login</Link>
          <Link to="/app-download" className="hover:text-blue-500 hover:underline">App Download</Link>
          <Link to="/feedback" className="hover:text-blue-500 hover:underline">Feedback</Link>
          <Link to="/admin-login" className="hover:text-blue-500 hover:underline">Admin Login</Link>
        </div>
        {/* Hamburger Icon */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={toggleMenu}
            className="focus:outline-none"
            aria-label="Toggle menu"
            title="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
        <Link to="/" className="block px-4 py-2 hover:bg-gray-200">Home</Link>
        <Link to="/bus-register" className="block px-4 py-2 hover:bg-gray-200">Register Bus</Link>
        <Link to="/bus-login" className="block px-4 py-2 hover:bg-gray-200">Bus Login</Link>
        <Link to="/app-Download" className="block px-4 py-2 hover:bg-gray-200">App Download</Link>
        <Link to="/feedback" className="block px-4 py-2 hover:bg-gray-200">Feedback</Link>
        <Link to="/admin-login" className="block px-4 py-2 hover:bg-gray-200">Admin Login</Link>
      </div>
    </nav>
  );
};

export default Header;
