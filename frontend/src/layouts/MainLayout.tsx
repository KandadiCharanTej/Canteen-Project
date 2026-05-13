import React from 'react';
import { Outlet } from 'react-router-dom';
import { Providers } from '../context/Providers'; // Assuming you have a Providers component or similar

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] antialiased">
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* Add Footer here if needed */}
    </div>
  );
};

export default MainLayout;


