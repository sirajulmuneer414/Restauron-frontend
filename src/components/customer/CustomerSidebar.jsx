import React, { useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Home, Menu as MenuIcon, Phone, ShoppingCart, LogIn, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAxios } from '../../axios/instances/axiosInstances';
import { setRestaurantConfig } from '../../redux/slice/restaurantConfigSlice'; 

const CustomerSidebar = ({ isCollapsed = false, setIsCollapsed }) => {
  const { encryptedId } = useParams();
  const customerPageRestaurantId = useSelector(state => state.specialValues.customerPageRestaurantId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { axiosPublicInstance } = useAxios();
  
  const user = useSelector(state => state.userSlice.user);
  
  // Safe Config Access
  const restaurantConfigState = useSelector(state => state.restaurantConfig);
  const config = restaurantConfigState?.config || {
      primaryColor: '#f59e0b',
      secondaryColor: '#000000',
      buttonTextColor: '#000000',
      restaurantName: 'Restauron'
  }; 
  
  const isCustomerLoggedIn = user && user.role === 'CUSTOMER';

  useEffect(() => {
    if (!encryptedId && !customerPageRestaurantId) return;
    const fetchConfig = async () => {
      try {
        if (encryptedId === "undefined") navigate(`/restaurant/${customerPageRestaurantId}/home`);
        const response = await axiosPublicInstance.get(`/restaurant/config/${encryptedId}`); 
        dispatch(setRestaurantConfig(response.data));
      } catch (error) {
        console.error("Config Fetch Error:", error);
      }
    };
    fetchConfig();
  }, [encryptedId]);

  const primaryColor = config.primaryColor || '#f59e0b'; 
  const secondaryColor = config.secondaryColor || '#000000'; 

  const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
      to={to}
      style={({ isActive }) => isActive ? { 
          backgroundColor: `${primaryColor}1A`, 
          color: primaryColor,
          borderLeftColor: primaryColor
      } : {}}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200
         ${isCollapsed ? 'justify-center' : ''}
         ${isActive 
            ? 'border-l-4 font-bold' 
            : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'}`
      }
    >
      <Icon size={20} className="shrink-0" />
      {!isCollapsed && <span className="font-medium whitespace-nowrap">{children}</span>}
    </NavLink>
  );

  return (
    <aside
      style={{ background: `linear-gradient(to bottom, ${secondaryColor}, #0f0f0f, ${secondaryColor})` }}
      // KEY CHANGE: z-40 ensures the sidebar is above normal content
      className={`fixed h-screen text-white shadow-xl border-r border-gray-800/60 flex flex-col transition-all duration-300 ease-in-out z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-800/60 relative">
        <div className={`flex items-center gap-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <div 
            style={{ backgroundColor: primaryColor, color: config.buttonTextColor }}
            className="h-9 w-9 rounded-lg shadow-lg shrink-0 flex items-center justify-center font-extrabold"
          >
            {config.restaurantName?.charAt(0) || 'R'}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis w-32">
              {config.restaurantName || 'Restauron'}
            </h1>
            <p className="text-xs uppercase tracking-widest text-gray-400 whitespace-nowrap">
              {config.topLeftQuote || 'Customer'}
            </p>
          </div>
        </div>
        
        {/* KEY CHANGE: 
            1. z-50 to ensure it's higher than sidebar (z-40) and main content (usually z-0 to z-20).
            2. Added shadow-lg to make it pop out visually.
        */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-gray-800 text-white rounded-full p-1.5 border-2 border-gray-950 transition-colors hover:text-black z-50 shadow-lg cursor-pointer"
          style={{ borderColor: secondaryColor }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = primaryColor; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1f2937'; }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="grow px-4 py-6 space-y-2">
        <NavItem to={`/restaurant/${encryptedId}/home`} icon={Home}>Home</NavItem>
        <NavItem to={`/restaurant/${encryptedId}/menu`} icon={MenuIcon}>Menu</NavItem>
        <NavItem to={`/restaurant/${encryptedId}/orders`} icon={ShoppingCart}>Orders</NavItem>
        {/* <NavItem to={`/restaurant/${encryptedId}/contact`} icon={Phone}>Contact</NavItem>
        <NavItem to={`/restaurant/${encryptedId}/cart`} icon={ShoppingCart}>Cart</NavItem> */}
      </nav>
      
      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800/60">
        <NavLink
            to={isCustomerLoggedIn ? `/customer/profile/${encryptedId}` : `/public/login/${encryptedId}`}
            style={{ 
                backgroundColor: `${primaryColor}1A`, 
                color: primaryColor, 
                borderColor: `${primaryColor}4D` 
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-200 font-semibold hover:opacity-90 hover:text-black"
            onMouseEnter={(e) => { 
                e.currentTarget.style.backgroundColor = primaryColor; 
                e.currentTarget.style.color = config.buttonTextColor;
            }}
            onMouseLeave={(e) => { 
                e.currentTarget.style.backgroundColor = `${primaryColor}1A`; 
                e.currentTarget.style.color = primaryColor;
            }}
        >
            {isCustomerLoggedIn ? <UserIcon size={20} /> : <LogIn size={20} />}
            {!isCollapsed && <span className="whitespace-nowrap">{isCustomerLoggedIn ? user.name : "Login"}</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default CustomerSidebar;

