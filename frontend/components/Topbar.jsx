import React from "react";

const Topbar = () => {
  return (
    <header className="bg-gray-900 bg-opacity-80 backdrop-blur-md py-4 px-4 sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-red-500">SpeakUp</h1>
      </div>
    </header>
  );
};

export default Topbar;
