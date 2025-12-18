import React from 'react';
import OwnerSidebar from '../../components/owner/OwnerSideBar';
import { Outlet } from 'react-router-dom';
// Import the handler
import NotificationHandler from '../../components/common/NotificationHandler';

function OwnerLayoutPage() {
    
    // It's cleaner to define the layout structure directly in the return
    // instead of defining a function inside a function.
    return (
        <div className="flex bg-black/50">
            {/* 1. Add the Handler here so it runs globally for owners */}
            <NotificationHandler />
            
            <OwnerSidebar />
            
            <main className="grow h-screen overflow-y-auto">
                <Outlet /> {/* Child routes will render here */}
            </main>
        </div>
    );
}

export default OwnerLayoutPage;
