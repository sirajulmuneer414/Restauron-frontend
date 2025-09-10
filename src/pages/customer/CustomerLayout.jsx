import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerSidebar from '../../components/customer/CustomerSidebar';

const CustomerLayout = () => {
  // We'll manage the collapsed state here in the parent layout
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex bg-black/50 min-h-screen">
      {/* 
        The CustomerSidebar is now positioned as 'fixed' and will not scroll.
        We pass the state and the function to toggle it as props.
      */}
      <CustomerSidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      
      {/* 
        The <main> content area needs a left margin that matches the 
        width of the sidebar. This prevents the sidebar from overlapping the content.
        We adjust this margin dynamically based on the sidebar's collapsed state.
      */}
      <main 
        className={`flex-grow transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;

