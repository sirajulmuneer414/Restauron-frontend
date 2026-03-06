import React from 'react';
import { ShieldOff, Mail, Phone } from 'lucide-react';
import { useSelector } from 'react-redux';

const EmployeeSuspendedPage = () => {
    const user = useSelector((state) => state.userSlice?.user);
    const restaurantName = user?.restaurantName || 'your restaurant';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border-t-4 border-orange-500">

                <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldOff className="text-orange-600 w-10 h-10" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Suspended</h1>
                <p className="text-gray-500 mb-6">
                    The subscription for <strong>{restaurantName}</strong> has been suspended. Your access to
                    the employee dashboard has been temporarily disabled.
                </p>

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mb-8 text-left space-y-3">
                    <p className="text-sm font-semibold text-orange-800 uppercase tracking-wider">
                        What you can do
                    </p>
                    <p className="text-sm text-gray-600">
                        Please contact your restaurant owner or manager to resolve the subscription issue. Once
                        the subscription is renewed, your access will be automatically restored.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 text-left space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Support Contact
                    </h3>
                    <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span>+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span>support@restauron.dev</span>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-gray-400 text-sm">
                Employee ID: {user?.id || 'UNKNOWN'}
            </p>
        </div>
    );
};

export default EmployeeSuspendedPage;
