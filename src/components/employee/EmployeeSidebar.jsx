import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Settings, LogOut, ChevronLeft, ChevronRight, Lock, ShoppingCart, UtensilsCrossed, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';

const EmployeeSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useSelector((state) => state.userSlice.user); // Get user data from Redux

  // A helper component for navigation links
  const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200
         ${isCollapsed ? 'justify-center' : ''}
         ${isActive
          ? 'bg-yellow-500/10 text-yellow-300 border-l-4 border-yellow-500'
          : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'}`
      }
    >
      <Icon size={20} className="flex-shrink-0" />
      {!isCollapsed && <span className="font-medium whitespace-nowrap">{children}</span>}
    </NavLink>
  );

  return (
    <aside
      className={`h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white shadow-xl border-r border-gray-800/60 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-24' : 'w-64'
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
            <p className="text-xs uppercase tracking-widest text-gray-400 whitespace-nowrap">Employee Panel</p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-gray-800 hover:bg-yellow-500 text-white hover:text-black rounded-full p-1.5 border-2 border-gray-950 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-grow px-4 py-6 space-y-2">
        <NavItem to="/employee/dashboard" icon={LayoutDashboard}>
          Dashboard
        </NavItem>
        <NavItem to={`/employee/profile/${user.specialId}`} icon={User}>
          Profile
        </NavItem>
        <NavItem to="/employee/menu" icon={Menu}>
          Menu
        </NavItem>
           <NavItem to="/employee/pos" icon={ShoppingCart}>
          New Order (POS)
        </NavItem>
        <NavItem to="/employee/kitchen" icon={UtensilsCrossed}>
          Kitchen Display
        </NavItem>

        <NavItem to="/employee/change-password" icon={Lock}>
          Change Password
        </NavItem>


      </nav>

      {/* Footer / User Profile & Logout Area */}
      <div className={`px-4 pt-4 border-t border-gray-800/60`}>
        <div className="flex items-center gap-3">
          <img
            // You can generate a simple avatar based on the user's name
            src={`https://ui-avatars.com/api/?name=${user?.name.replace(' ', '+')}&background=f59e0b&color=000`}
            alt={user?.name}
            className="w-10 h-10 rounded-full border-2 border-yellow-500/50"
          />
          <div className={`transition-opacity duration-200 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <h4 className="font-semibold text-white whitespace-nowrap">{user?.name}</h4>
            <p className="text-xs text-gray-400 whitespace-nowrap">Employee</p>
          </div>
        </div>
      <button className="w-full mt-4 mb-1 flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="font-medium whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
