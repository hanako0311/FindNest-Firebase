import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl">
        <div className="md:w-1/2">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-6">
            FindNest
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your reliable tool for managing lost and found items with ease.
          </p>
          <Link to="/report-form" className="inline-block">
            <button className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300">
              Report Here
            </button>
          </Link>
        </div>

        <div className="md:w-1/2">
          <img
            src="/lf.png"
            alt="FindNest Illustration"
            className="w-3/4 h-auto mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
