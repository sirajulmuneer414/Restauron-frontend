import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import toast, { Toaster } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import NewOrderModal from './NewOrderModal '; // Ensure filename space is correct

const NotificationHandler = () => {
    const { notifications } = useWebSocket();
    const [latestOrder, setLatestOrder] = useState(null);
        
    // Effect to trigger Toast when a new notification arrives
    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            
            // 1. Ignore "Silent" Refresh Signals
            if (latest.type === 'REFRESH_ORDERS') return;

            // 2. Check recency (increased to 5s for safety)
            const isRecent = (new Date() - new Date(latest.receivedAt)) < 5000;
            
            if (isRecent) {
                if(latest.type === 'NEW_ORDER' || latest.type === 'ORDER_ALERT') {
                    setLatestOrder(latest);
                }
                else {
                    // Regular Notifications (Announcements, etc.)
                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="shrink-0 pt-0.5">
                                        <Bell className="h-10 w-10 text-indigo-600 bg-indigo-50 rounded-full p-2" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {latest.title || 'New Notification'}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {latest.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-gray-200">
                                <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ), { duration: 5000 });
                }
            }
        }
    }, [notifications]);

    return (
        <>
            <Toaster position="top-right" />
            {latestOrder && (
                <NewOrderModal
                    order={latestOrder}
                    onClose={() => setLatestOrder(null)}
                />
            )}
        </>
    );
};

export default NotificationHandler;

