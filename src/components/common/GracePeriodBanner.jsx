import React from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const GracePeriodBanner = ({ status, daysLeft }) => {
  if (status === 'FULL' || status === 'ACTIVE') return null;

  const isReadOnly = status === 'READ_ONLY';
  const isGrace = status === 'PARTIAL';

  return (
    <div className={`w-full px-4 py-3 flex items-center justify-between shadow-sm border-b ${
      isReadOnly 
        ? 'bg-red-50 border-red-100 text-red-800' 
        : 'bg-yellow-50 border-yellow-100 text-yellow-800'
    }`}>
      <div className="flex items-center gap-3">
        {isReadOnly ? <Lock className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <div>
          <span className="font-bold">
            {isReadOnly ? 'Read-Only Mode Active' : 'Subscription Expiring Soon'}
          </span>
          <span className="hidden md:inline ml-2 text-sm opacity-90">
            {isReadOnly 
              ? 'Your subscription has expired. You cannot modify menus or accept orders.' 
              : 'Your grace period is active. Please renew to avoid service interruption.'}
          </span>
        </div>
      </div>

      <Link 
        to="/owner/subscription" 
        className={`text-sm font-bold px-4 py-2 rounded-lg transition ${
          isReadOnly 
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-yellow-600 text-white hover:bg-yellow-700'
        }`}
      >
        Renew Now
      </Link>
    </div>
  );
};

export default GracePeriodBanner;
