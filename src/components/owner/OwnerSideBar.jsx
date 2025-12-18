import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  ClipboardList,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  DollarSign,
  Table,
  ChartColumnBig,
  UserPen,
  ListOrdered,
  Building,
  Package 
} from 'lucide-react';
import { useSelector } from 'react-redux';

const OwnerSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const user = useSelector((state) => state.userSlice.user);
  const restaurantName = useSelector((state) => state.ownerDetailsSlice.restaurantName);
  
  // Helper to get the first letter safely
  const restaurantInitial = restaurantName ? restaurantName.charAt(0).toUpperCase() : 'R';

  const commonLinkClasses = 'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200';
  const activeClasses = 'bg-yellow-500/10 text-yellow-300 border-l-4 border-yellow-500';
  const inactiveClasses = 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent';
  
  const linkClasses = ({ isActive }) =>
    `${commonLinkClasses} ${isCollapsed ? 'justify-center' : ''} ${isActive ? activeClasses : inactiveClasses}`;

  return (
    <aside
      className={`h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white shadow-xl border-r border-gray-800/60 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-24' : 'w-64'
      }`}
    >
      {/* Header and Toggle Button */}
      <div className="px-4 py-5 border-b border-gray-800/60 relative">
        <div className={`flex items-center gap-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <div className="h-9 w-9 rounded-lg bg-yellow-500 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex-shrink-0 flex items-center justify-center text-black font-extrabold">
            R
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide whitespace-nowrap">Restauron</h1>
            <p className="text-xs uppercase tracking-widest text-gray-400 whitespace-nowrap">Owner Panel</p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-gray-800 hover:bg-yellow-500 text-white hover:text-black rounded-full p-1.5 border-2 border-gray-950 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 py-6 space-y-4 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <NavLink to="/owner/dashboard" className={linkClasses}>
              <LayoutDashboard size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Dashboard</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner/restaurant-settings" className={linkClasses}>
              <Building size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Restaurant Settings</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner/subscriptions" className={linkClasses}>
              <Package size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Subscription Management</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner/orders" className={linkClasses}>
              <ClipboardList size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Orders</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner/menu" className={linkClasses}>
              <Utensils size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Menu Management</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner/customers" className={linkClasses}>
              <UserPen size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Customer Management</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner/employees/list" className={linkClasses}>
              <Users size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Employees Management</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner/tables" className={linkClasses}>
              <Table size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Table Management</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner/category" className={linkClasses}>
              <ChartColumnBig size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Category Management</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/owner/reservations" className={linkClasses}>
              <ListOrdered size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Reservation Management</span>}
            </NavLink>
          </li>
{/*           
          <li>
            <NavLink to="/owner/settings" className={linkClasses}>
              <Settings size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Settings</span>}
            </NavLink>
          </li> */}
        </ul>

        {/* Divider */}
        <hr className={`border-gray-800/60 my-4 ${isCollapsed ? 'mx-2' : 'mx-4'}`} />

        {/* Secondary Menu */}
        <ul className="space-y-2">
           <li>
                <NavLink to="/owner/reports" className={linkClasses}>
                    <DollarSign size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">Reports & Analytics</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/owner/promotions" className={linkClasses}>
                    <Sun size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">Promotions</span>}
                </NavLink>
            </li>
        </ul>
      </nav>

      {/* Footer / User Profile Area */}
      <div className={`px-4 py-4 border-t border-gray-800/60`}>
        <div className="flex items-center gap-3">
          {/* Changed Image to Initial Div */}
          <div className="w-10 h-10 rounded-full border-2 border-yellow-500/50 bg-gray-800 flex items-center justify-center text-yellow-500 font-bold text-lg flex-shrink-0">
            {restaurantInitial}
          </div>
          
          <div className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <h4 className="font-semibold text-white whitespace-nowrap">{user?.name}</h4>
            <p className="text-xs text-gray-400 whitespace-nowrap">{restaurantName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OwnerSidebar;

