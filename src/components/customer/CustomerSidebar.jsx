import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, Menu as MenuIcon, Phone, ShoppingCart, LogIn, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { axiosPublicInstance } from '../../axios/instances/axiosInstances'; // Ensure this path is correct

const CustomerSidebar = ({ isCollapsed = false, setIsCollapsed }) => {
  const { encryptedId } = useParams();
  const navigate = useNavigate();
  
  // Get user data from Redux store
  const user = useSelector(state => state.userSlice.user);
  
  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const [isLoading, setIsLoading] = useState(true);

  // Check if a customer is logged in
  const isCustomerLoggedIn = user && user.role === 'CUSTOMER';
  
  // --- Fetch restaurant data when the component mounts ---
  useEffect(() => {
    // If a customer is logged in, use their name immediately
    if (isCustomerLoggedIn) {
      setIsLoading(false);
      return;
    }

    if (!encryptedId) {
      setIsLoading(false);
      return;
    }

    const fetchRestaurantName = async () => {
      try {
        const response = await axiosPublicInstance.get(`/restaurant/details/${encryptedId}`);
        setRestaurantName(response.data.name);
      } catch (error) {
        console.error("Failed to fetch restaurant name:", error);
        setRestaurantName("Not Found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurantName();
  }, [encryptedId, user, isCustomerLoggedIn]);

  const navItems = [
    { name: 'Home', icon: Home, path: `/restaurant/${encryptedId}` }, // Adjusted path
    { name: 'Menu', icon: MenuIcon, path: `/restaurant/${encryptedId}/menu` },
    { name: 'Contact', icon: Phone, path: `/restaurant/${encryptedId}/contact` },
    { name: 'Cart', icon: ShoppingCart, path: `/restaurant/${encryptedId}/cart` },
  ];

  const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
      to={to}
      end={to.split('/').length <= 3} // Use 'end' prop only for the base restaurant route
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
      className={`fixed h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white shadow-xl border-r border-gray-800/60 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="px-4 py-5 border-b border-gray-800/60 relative">
        <div className={`flex items-center gap-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <div className="h-9 w-9 rounded-lg bg-yellow-500 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex-shrink-0 flex items-center justify-center text-black font-extrabold">
            {isLoading ? '...' : restaurantName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide whitespace-nowrap">
              {isLoading ? 'Loading...' : restaurantName}
            </h1>
            <p className="text-xs uppercase tracking-widest text-gray-400 whitespace-nowrap">
              {isCustomerLoggedIn ? 'Customer' : 'Restaurant'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-gray-800 hover:bg-yellow-500 text-white hover:text-black rounded-full p-1.5 border-2 border-gray-950 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      <nav className="flex-grow px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavItem key={item.name} to={item.path} icon={item.icon}>
            {item.name}
          </NavItem>
        ))}
      </nav>
      
      <div className="px-4 py-4 border-t border-gray-800/60">
        {isCustomerLoggedIn ? (
          <NavLink
            to="/customer/profile" // <-- Navigate to customer profile
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-black border border-yellow-500/30 hover:border-yellow-500 transition-colors duration-200 font-semibold"
          >
            <UserIcon size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">My Profile</span>}
          </NavLink>
        ) : (
          <NavLink
            to={`/public/login/${encryptedId}`} // <-- Navigate to the login page for this restaurant
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-black border border-yellow-500/30 hover:border-yellow-500 transition-colors duration-200 font-semibold"
          >
            <LogIn size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Login</span>}
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default CustomerSidebar;

