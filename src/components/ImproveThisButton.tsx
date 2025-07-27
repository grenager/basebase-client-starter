import React, { useState } from 'react';

const ImproveThisButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleStartEditingClick = (): void => {
    // get the user's token from Local Storage
    const token = localStorage.getItem('basebase_token');
    window.open(
      `https://editor.basebase.us/?project=test_project&repo=https://github.com/grenager/basebase-client-starter&token=${token}`,
      '_blank'
    );
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 z-50"
      >
        ✨ Improve This
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal content */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-6">
                <span className="text-2xl">🚀</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You can edit this app! 🚀
              </h2>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                This is a "community sourced" app built on BaseBase, that is continuously being created and updated by its community of users!
                <br />
                <br />
                This app can be modified by anyone in the world - including you! - using the BaseEditor. 
                <br />
                <br />
                Click below to open a new page where you can make changes and submit them immediately to the app owner.
              </p>
              
              <button
                onClick={handleStartEditingClick}
                className="w-full bg-gradient-to-r from-gray-800 to-black text-white font-semibold py-3 px-6 rounded-lg hover:from-gray-900 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Start Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImproveThisButton; 