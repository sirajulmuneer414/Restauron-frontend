import React from 'react';
import { AlertTriangle, Phone, Mail, CreditCard, ListOrdered } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ServiceSuspendedPage = () => {
  const user = useSelector((state) => state.userSlice?.user);
  const navigate = useNavigate();

  const restaurantName = user?.restaurantName || 'Restaurant';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">

        <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-600 w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Temporarily Suspended</h1>
        <p className="text-gray-500 mb-8">
          The subscription for <strong>{restaurantName}</strong> has expired and the grace period has
          ended. Access to the dashboard is currently restricted.
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

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/owner/subscription')}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-5 rounded-xl hover:bg-red-700 transition"
          >
            <CreditCard size={18} />
            Manage Subscription
          </button>
          <button
            onClick={() => navigate('/owner/subscription/plans')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white font-bold py-3 px-5 rounded-xl hover:bg-gray-900 transition"
          >
            <ListOrdered size={18} />
            View Plans
          </button>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm">
        Reference ID: {user?.restaurantId || 'UNKNOWN'}
      </p>
    </div>
  );
};

export default ServiceSuspendedPage;
