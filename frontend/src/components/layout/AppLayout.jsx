import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { UploadModal } from '../upload/UploadModal';
import { QueueDrawer } from '../queue/QueueDrawer';
import { useUI } from '../../context/UIContext';

export const AppLayout = () => {
  const { isSidebarOpen } = useUI();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1] flex flex-col">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main
          className={`flex-1 min-w-0 transition-all duration-200 pb-12 ${
            isSidebarOpen ? 'lg:pl-60' : 'lg:pl-18'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Global Upload Modal */}
      <UploadModal />

      {/* Global Queue Drawer / Toast Controller */}
      <QueueDrawer />
    </div>
  );
};
