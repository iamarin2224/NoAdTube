import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);

  return (
    <UIContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        isUploadModalOpen,
        openUploadModal,
        closeUploadModal,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
