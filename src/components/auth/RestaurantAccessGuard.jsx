import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const RestaurantAccessGuard = ({ children }) => {
  const { user } = useSelector((state) => state.userSlice);
  const navigate = useNavigate();
  const location = useLocation();

  // Paths the OWNER can still visit even when BLOCKED (subscription renewal flow)
  const OWNER_WHITELISTED_PATHS = [
    '/owner/subscription',
    '/owner/subscription/plans',
    '/owner/profile',
  ];

  useEffect(() => {
    if (user?.restaurantAccessLevel !== 'BLOCKED') return;

    const isOwner = user?.role?.toLowerCase() === 'owner';
    const isEmployee = user?.role?.toLowerCase() === 'employee';

    if (isOwner) {
      const isWhitelisted = OWNER_WHITELISTED_PATHS.some((path) =>
        location.pathname.startsWith(path)
      );
      if (!isWhitelisted && location.pathname !== '/service-suspended') {
        navigate('/service-suspended', { replace: true });
      }
    } else if (isEmployee) {
      if (location.pathname !== '/employee-suspended') {
        navigate('/employee-suspended', { replace: true });
      }
    }
  }, [user, location, navigate]);

  // Don't render children on the suspended pages to avoid layout bleed
  if (
    location.pathname === '/service-suspended' ||
    location.pathname === '/employee-suspended'
  ) {
    return null;
  }

  return <>{children}</>;
};

export default RestaurantAccessGuard;
