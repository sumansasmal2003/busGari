import React from 'react';
import { HiDownload } from 'react-icons/hi';
import { FaAndroid } from 'react-icons/fa';
import '@fontsource/poppins';

const AppDownload: React.FC = () => {
  return (
    <section className="bg-gray-100 py-12 sm:py-16" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Download Our App</h1>
          <p className="text-lg sm:text-xl text-gray-700">
            Get access to all our features directly on your Android device. Download the APK file and enjoy our app today!
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <HiDownload className="text-blue-500 text-4xl mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2">Easy Access</h2>
            <p className="text-gray-600">
              Quickly access all features and get real-time updates directly on your device.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <HiDownload className="text-green-500 text-4xl mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2">Seamless Experience</h2>
            <p className="text-gray-600">
              Enjoy a smooth, intuitive user experience designed for efficiency.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <HiDownload className="text-red-500 text-4xl mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2">24/7 Support</h2>
            <p className="text-gray-600">
              Our support team is available around the clock for any assistance you need.
            </p>
          </div>
        </div>

        {/* Download Link Section */}
        <div className="text-center mb-12">
          <p className="text-lg sm:text-xl mb-4 text-gray-700">
            Download the APK file for Android:
          </p>
          <a
            href="https://drive.google.com/file/d/1wrOnfGyVjM5btxPcVcBdtjh2Y5RPJBgO/view?usp=drive_link" // Replace with your actual APK file path
            download
            className="flex items-center justify-center bg-blue-600 text-white p-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            <FaAndroid className="text-2xl mr-2" />
            <span>Download APK</span>
          </a>
        </div>

        {/* Footer Section */}
        <div className="text-center">
          <p className="text-gray-600">
            For more information or support, <a href="/contact" className="text-blue-500 hover:underline">contact us</a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
