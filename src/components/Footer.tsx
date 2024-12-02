import React from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import { HiMail } from 'react-icons/hi';
import { BsPhone } from 'react-icons/bs';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">About Us</h2>
            <p className="text-gray-400">
              We are dedicated to providing the best services for our users. Our mission is to deliver high-quality solutions with a focus on reliability and customer satisfaction.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-gray-300">Home</Link></li>
              <li><Link to="/app-download" className="hover:text-gray-300">Download App</Link></li>
              <li><Link to="/bus-login" className="hover:text-gray-300">Bus Login</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <ul className="space-y-4">
              <li className="flex items-center">
                <HiMail className="text-blue-400 text-2xl mr-3" />
                <Link to="#" className="hover:text-gray-300">abcd@gmail.com</Link>
              </li>
              <li className="flex items-center">
                <BsPhone className="text-green-400 text-2xl mr-3" />
                <Link to="tel:+1234567890" className="hover:text-gray-300">+123-456-7890</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center mt-8">
          <Link to="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white mx-2">
            <FaFacebookF className="text-2xl" />
          </Link>
          <Link to="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white mx-2">
            <FaTwitter className="text-2xl" />
          </Link>
          <Link to="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white mx-2">
            <FaLinkedinIn className="text-2xl" />
          </Link>
          <Link to="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white mx-2">
            <FaInstagram className="text-2xl" />
          </Link>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gray-900 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Busgari. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
