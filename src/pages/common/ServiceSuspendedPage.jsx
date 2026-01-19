import React from 'react';
import { AlertTriangle, Phone, Mail } from 'lucide-react';
import { useSelector } from 'react-redux';

const ServiceSuspendedPage = () => {
  const user = useSelector((state) => state.userSlice?.user);
  
  // Optional: Get restaurant details if available in Redux, 
  // otherwise fallback to generic message.
  const restaurantName = user?.restaurantName || "Restaurant";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
        
        <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-600 w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Temporarily Suspended</h1>
        <p className="text-gray-500 mb-8">
          The subscription for <strong>{restaurantName}</strong> has expired and the grace period has ended. 
          Access to the dashboard and customer ordering is currently blocked.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 text-left space-y-4 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact Support</h3>
          
          <div className="flex items-center gap-3 text-gray-700">
            <Phone className="w-5 h-5 text-gray-400" />
            <span>+91 98765 43210</span>
          </div>
          
          <div className="flex items-center gap-3 text-gray-700">
            <Mail className="w-5 h-5 text-gray-400" />
            <span>support@restauron.dev</span>
          </div>
        </div>

        <button 
          onClick={() => globalThis.location.href = '/subscription/plans'}
          className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 transition"
        >
          Renew Subscription Now
        </button>
      </div>
      
      <p className="mt-8 text-gray-400 text-sm">
        Reference ID: {user?.restaurantId || 'UNKNOWN'}
      </p>
    </div>
  );
};

export default ServiceSuspendedPage;
