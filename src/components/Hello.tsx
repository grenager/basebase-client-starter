import React from 'react';

const Hello: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to BaseBase
          </h1>
          <p className="text-lg text-gray-600">
            A modern React starter with beautiful design
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
            <span className="text-2xl">👋</span>
          </div>
          
          <p className="text-gray-700">
            Built with React, TypeScript, Vite, and Tailwind CSS for rapid development.
          </p>
          
          <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hello; 