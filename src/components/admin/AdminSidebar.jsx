import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Users, Building, Package, Currency, Bell } from 'lucide-react';


const AdminSidebar = () => {
  const itemBase =
    'group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors';
  const activeClasses =
    'bg-amber-500/15 text-amber-300 border border-amber-500/30';
  const inactiveClasses =
    'text-gray-200 hover:text-white hover:bg-white/5 border border-transparent';

  const linkClasses = ({ isActive }) =>
    `${itemBase} ${isActive ? activeClasses : inactiveClasses}`;

  return (
    <aside className="h-screen w-68 bg-linear-to-b from-black via-gray-950 to-black text-white shadow-xl border-r border-gray-800/60">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-800/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-center justify-center text-black font-extrabold">
            R
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Restauron</h1>
            <p className="text-[11px] uppercase tracking-widest text-gray-400">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 space-y-6 overflow-y-auto h-[calc(100vh-140px)]">
        {/* Section: Overview */}
        <div>
          <p className="px-2 mb-2 text-[11px] tracking-widest uppercase text-gray-500">
            Overview
          </p>
          <ul className="space-y-1.5">
            <li>
              <NavLink to="/admin/dashboard" className={linkClasses}>
                {({ isActive }) => (
                  <>
                    <span
                      className={`h-5 w-1 rounded-full transition-colors ${
                        isActive ? 'bg-amber-500' : 'bg-transparent group-hover:bg-white/20'
                      }`}
                    />
                    <LayoutDashboard
                      size={18}
                      className={`transition-colors ${
                        isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    <span>Dashboard</span>
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Section: Operations */}
        <div>
          <p className="px-2 mb-2 text-[11px] tracking-widest uppercase text-gray-500">
            Operations
          </p>
          <ul className="space-y-1.5">
            <li>
              <NavLink to="/admin/restaurant/requests" className={linkClasses}>
                {({ isActive }) => (
                  <>
                    <span
                      className={`h-5 w-1 rounded-full transition-colors ${
                        isActive ? 'bg-amber-500' : 'bg-transparent group-hover:bg-white/20'
                      }`}
                    />
                    <UtensilsCrossed
                      size={18}
                      className={`transition-colors ${
                        isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    <span>Restaurant Approval Requests</span>
                   
                  </>
                )}
              </NavLink>
            </li> 
            
            <li>
              <NavLink to="/admin/restaurants" className={linkClasses} end>
                {({ isActive }) => (
                  <>
                    <span className={`h-5 w-1 rounded-full transition-colors ${isActive ? 'bg-amber-500' : 'bg-transparent group-hover:bg-white/20'}`} />
                    <Building
                      size={18}
                      className={`transition-colors ${isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-white'}`}
                    />
                    <span>Restaurant Management</span>
                  </>
                )}
              </NavLink>
            </li>


            <li>
              <NavLink to="/admin/users" className={linkClasses}>
                {({ isActive }) => (
                  <>
                    <span
                      className={`h-5 w-1 rounded-full transition-colors ${
                        isActive ? 'bg-amber-500' : 'bg-transparent group-hover:bg-white/20'
                      }`}
                    />
                    <Users
                      size={18}
                      className={`transition-colors ${
                        isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    <span>User Management</span>
                  </>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/subscriptions" className={linkClasses}>
                {({ isActive }) => (
                  <>
                    <span
                      className={`h-5 w-1 rounded-full transition-colors ${
                        isActive ? 'bg-amber-500' : 'bg-transparent group-hover:bg-white/20'
                      }`}
                    />  
                    <Package
                      size={18}
                      className={`transition-colors ${
                        isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    <span>Subscription Management</span>
                  </>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/payments" className={linkClasses}>
                {({ isActive }) => (
                  <>
                    <span
                      className={`h-5 w-1 rounded-full transition-colors ${
                        isActive ? 'bg-amber-500' : 'bg-transparent group-hover:bg-white/20'
                      }`}
                    />  
                    <Currency
                      size={18}
                      className={`transition-colors ${
                        isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    <span>Payment History</span>
                  </>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/notifications" className={linkClasses}>
                {({ isActive }) => (
                  <>
                    <span
                      className={`h-5 w-1 rounded-full transition-colors ${
                        isActive ? 'bg-amber-500' : 'bg-transparent group-hover:bg-white/20'
                      }`}
                    />  
                    <Bell
                      size={18}
                      className={`transition-colors ${
                        isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-white'  
                      }`}
                    />
                    <span>Notifications</span>
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-800/60 px-4 py-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Restauron</p>
          <p className="text-[10px] text-gray-600">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
