import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    CheckCircle, 
    Flame, 
    Bell, 
    MapPin, 
    ShoppingBag, 
    Utensils, 
    Timer,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmployeeService } from '../../../services/employeeService';
import { useWebSocket } from '../../../hooks/useWebSocket'; 

const KitchenDisplay = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    
    const employeeService = useEmployeeService();
    const { notifications } = useWebSocket(); 

    // --- FETCH DATA ---
    const fetchOrders = async () => {
        try {
            const data = await employeeService.getActiveOrders();
            setOrders(data);
        } catch (error) {
            console.error("KDS Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- EFFECTS ---
    useEffect(() => {
        fetchOrders();
        const safetyInterval = setInterval(fetchOrders, 60000);
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => {
            clearInterval(safetyInterval);
            clearInterval(clockInterval);
        };
    }, []);

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0]; 
            if (latest.type === 'REFRESH_ORDERS' || latest.type === 'NEW_ORDER') {
                fetchOrders(); 
            }
        }
    }, [notifications]);

    const handleStatusChange = async (orderId, newStatus) => {
        const previousOrders = [...orders];
        setOrders(orders.map(o => o.encryptedId === orderId ? { ...o, status: newStatus } : o));

        try {
            await employeeService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order moved to ${newStatus}`);
            fetchOrders(); 
        } catch (error) {
            setOrders(previousOrders); 
            toast.error("Failed to update status"+(error?.response?.data?.message || ""));
        }
    };

    // --- HELPERS ---
    const getElapsedTime = (dateString) => {
        const start = new Date(dateString);
        const diff = Math.floor((currentTime - start) / 60000);
        if (diff < 1) return 'Just now';
        return `${diff} min ago`;
    };

    const getStatusColor = (status, timeElapsed) => {
        const isUrgent = status === 'PENDING' && timeElapsed > 20;
        if (isUrgent) return 'border-l-red-500 bg-red-50';
        switch (status) {
            case 'PENDING': return 'border-l-yellow-400 bg-white';
            case 'PREPARING': return 'border-l-blue-500 bg-white';
            case 'READY': return 'border-l-green-500 bg-white';
            default: return 'border-l-gray-300 bg-white';
        }
    };

    // --- SUB-COMPONENT ---
    const OrderCard = ({ order, actionLabel, onAction }) => {
        const start = new Date(order.orderDate);
        const diffMins = Math.floor((new Date() - start) / 60000);
        
        return (
            <div className={`p-4 rounded-lg shadow-sm border border-gray-100 border-l-4 mb-4 transition-all duration-300 hover:shadow-md ${getStatusColor(order.status, diffMins)}`}>
                <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-lg text-gray-800">#{order.billNumber || order.encryptedId.substring(0, 6)}</span>
                            {diffMins > 20 && order.status !== 'READY' && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Late</span>
                            )}
                        </div>
                        {order.orderType === 'TAKE_AWAY' ? (
                            <div className="flex items-center gap-1.5 text-orange-600 text-sm font-semibold mt-1">
                                <ShoppingBag size={14} />
                                <span className="truncate max-w-[150px]">{order.customerName || "Guest"}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold mt-1">
                                <MapPin size={14} />
                                <span>Table {order.restaurantTable?.name || "?"}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-full">
                        <Timer size={12} />
                        {getElapsedTime(order.orderDate)}
                    </div>
                </div>
                <ul className="space-y-2 mb-4">
                    {order.items && order.items.map((item, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                            <span className="font-bold text-gray-900 min-w-6">{item.quantity}x</span>
                            <span className="leading-tight">{item.menuItemName}</span>
                        </li>
                    ))}
                </ul>
                {actionLabel && (
                    <button 
                        onClick={() => onAction(order.encryptedId)}
                        className={`w-full py-2.5 rounded-md text-sm font-bold text-white transition transform active:scale-95 flex items-center justify-center gap-2
                            ${order.status === 'PENDING' ? 'bg-gray-900 hover:bg-black' : 
                              order.status === 'PREPARING' ? 'bg-blue-600 hover:bg-blue-700' : 
                              'bg-green-600 hover:bg-green-700'}`}
                    >
                        {order.status === 'PREPARING' && <Flame size={16} className={order.status === 'PREPARING' ? "animate-pulse" : ""} />}
                        {actionLabel}
                    </button>
                )}
            </div>
        );
    };

    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    const preparingOrders = orders.filter(o => o.status === 'PREPARING');
    const readyOrders = orders.filter(o => o.status === 'READY');

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-500 gap-2">
            <RefreshCw className="animate-spin" /> Loading Kitchen Display...
        </div>
    );

    return (
        // KEY CHANGE HERE: Allow body scroll on mobile (h-auto), fixed on desktop (md:h-screen)
        <div className="p-4 bg-gray-100 min-h-screen font-sans flex flex-col md:h-screen h-auto md:overflow-hidden overflow-y-auto">
            
            <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                        <Utensils size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Kitchen Display System</h1>
                        <p className="text-xs text-gray-500">Live Feed • <span className="text-green-600 font-bold">Real-time Active</span></p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-center px-4 border-r border-gray-100">
                        <span className="block text-2xl font-bold text-gray-800">{orders.length}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Total</span>
                    </div>
                </div>
            </header>

            {/* KEY CHANGE HERE: Grid container adjustments for mobile scrolling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 md:overflow-hidden min-h-0">
                
                {/* Column 1 */}
                <div className="flex flex-col h-[500px] md:h-full bg-gray-200/60 p-2 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3 px-2 py-1 shrink-0">
                        <h2 className="font-bold text-gray-600 flex items-center gap-2 uppercase text-xs tracking-wider">
                            <Bell size={14} /> Pending
                        </h2>
                        <span className="bg-gray-300 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{pendingOrders.length}</span>
                    </div>
                    <div className="overflow-y-auto flex-1 px-1 scrollbar-hide space-y-3">
                        {pendingOrders.map(order => (
                            <OrderCard key={order.encryptedId} order={order} actionLabel="Start Cooking" onAction={(id) => handleStatusChange(id, 'PREPARING')} />
                        ))}
                    </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col h-[500px] md:h-full bg-blue-50/60 p-2 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between mb-3 px-2 py-1 shrink-0">
                        <h2 className="font-bold text-blue-700 flex items-center gap-2 uppercase text-xs tracking-wider">
                            <Flame size={14} /> Preparing
                        </h2>
                        <span className="bg-blue-200 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{preparingOrders.length}</span>
                    </div>
                    <div className="overflow-y-auto flex-1 px-1 scrollbar-hide space-y-3">
                        {preparingOrders.map(order => (
                            <OrderCard key={order.encryptedId} order={order} actionLabel="Mark Ready" onAction={(id) => handleStatusChange(id, 'READY')} />
                        ))}
                    </div>
                </div>

                {/* Column 3 */}
                <div className="flex flex-col h-[500px] md:h-full bg-green-50/60 p-2 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between mb-3 px-2 py-1 shrink-0">
                        <h2 className="font-bold text-green-700 flex items-center gap-2 uppercase text-xs tracking-wider">
                            <CheckCircle size={14} /> Ready to Serve
                        </h2>
                        <span className="bg-green-200 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{readyOrders.length}</span>
                    </div>
                    <div className="overflow-y-auto flex-1 px-1 scrollbar-hide space-y-3">
                        {readyOrders.map(order => (
                            <OrderCard key={order.encryptedId} order={order} actionLabel="Complete Order" onAction={(id) => handleStatusChange(id, 'COMPLETED')} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default KitchenDisplay;
