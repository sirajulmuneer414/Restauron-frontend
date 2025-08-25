import React from 'react'
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

function AdminLayoutPage() {

    const AdminLayout = () => (
         <div className="flex bg-black/50">
    <AdminSidebar />
    <main className="flex-grow p-6 h-screen overflow-y-auto">
      <Outlet /> {/* Child routes will render here */}
    </main>
  </div>
    );

    return AdminLayout();
 
}

export default AdminLayoutPage;