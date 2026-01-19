import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const RestaurantAccessGuard = ({ children }) => {
  const { user } = useSelector((state) => state.userSlice);
  const navigate = useNavigate();
  const location = useLocation();

  // Allowed paths even if blocked (e.g. Subscription/Payment pages)
  const WHITELISTED_PATHS = ['/owner/subscription', '/owner/profile'];

  useEffect(() => {
    if (user?.restaurantAccessLevel === 'BLOCKED') {
      // If blocked and not on a whitelisted page, redirect
      if (!WHITELISTED_PATHS.some(path => location.pathname.includes(path))) {
        navigate('/service-suspended', { replace: true });
      }
    }
  }, [user, location, navigate]);

  // If currently on the suspended page, don't render children (avoid loop)
  if (location.pathname === '/service-suspended') {
    return null; 
  }

  return <>{children}</>;
};

export default RestaurantAccessGuard;
