import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    User, 
    Calendar, 
    Utensils, 
    ChefHat, 
    LayoutGrid, 
    Activity,
    Clock,
    ShoppingBag
} from 'lucide-react';
import { useEmployeeService } from '../../services/employeeService';
import { useWebSocket } from '../../hooks/useWebSocket'; // Ensure path is correct
// import toast from 'react-hot-toast'; // Optional for errors

const EmployeeDashboard = () => {
    // --- HOOKS & STATE ---
    const user = useSelector((state) => state.userSlice.user);
    const navigate = useNavigate();
    const employeeService = useEmployeeService();
    
    // WebSocket Hook
    const { notifications } = useWebSocket(); 

    const [stats, setStats] = useState({
        pendingOrders: 0,
        activeTables: 0,
        todayRevenue: "---"
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- DATA FETCHING ---
    const loadDashboard = async () => {
        try {
            // Fetch live data from backend
            const activeOrders = await employeeService.getActiveOrders();
            const tables = await employeeService.getAllTables();
            
            // Calculate Stats Client-Side
            const pendingCount = activeOrders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length;
            const busyTables = tables.filter(t => t.status === 'OCCUPIED').length;

            setStats({
                pendingOrders: pendingCount,
                activeTables: busyTables,
                todayRevenue: "---" // Placeholder until endpoint exists
            });

            // Update Feed (Top 5 recent)
            // Assuming the API returns sorted by date DESC, otherwise sort here:
            // activeOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            setRecentOrders(activeOrders.slice(0, 5));
            
        } catch (error) {
            console.error("Dashboard Sync Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- EFFECT 1: Initial Load & Safety Poll ---
    useEffect(() => {   
        loadDashboard();
        
        // Safety Net: Poll every 60 seconds in case WebSocket misses a beat
        const interval = setInterval(loadDashboard, 60000);
        return () => clearInterval(interval);
    }, []);

    // --- EFFECT 2: WebSocket Listener (Push-to-Refresh) ---
    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0]; // Get the newest message
            
            // Check for relevant signals
            // 'REFRESH_ORDERS' comes from sendRefreshSignal()
            // 'NEW_ORDER' comes from sendOrderAlert() (via useWebSocket internal logic)
            if (latest.type === 'REFRESH_ORDERS' || latest.type === 'NEW_ORDER') {
                console.log("⚡ Dashboard: WebSocket Signal Received. Refreshing Data...");
                loadDashboard(); 
            }
        }
    }, [notifications]);


    // --- UI COMPONENTS ---
    const ActionCard = ({ icon: Icon, title, description, path, color }) => (
        <div
            onClick={() => navigate(path)}
            className={`group relative overflow-hidden bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-${color}-500/50 hover:bg-gray-900/80 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]`}
        >
            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl group-hover:bg-${color}-500/20 transition-all`} />
            <div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${color}-500/20 to-transparent border border-${color}-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`text-${color}-400`} size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{description}</p>
            </div>
            <div className="mt-6 flex items-center justify-end text-sm font-semibold text-yellow-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                Launch <ArrowRight size={16} className="ml-2" />
            </div>
        </div>
    );

    const ActivityItem = ({ order }) => (
        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-white/10 animate-fadeIn">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                ${order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : 
                  order.status === 'READY' ? 'bg-green-500/20 text-green-500' : 
                  'bg-blue-500/20 text-blue-500'}`}>
                {order.status === 'PENDING' ? <Clock size={18} /> : 
                 order.status === 'READY' ? <Activity size={18} /> : <ChefHat size={18} />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                    Order #{order.billNumber || order.id} 
                    <span className="text-gray-500 text-sm ml-2">
                        ({order.orderType === 'TAKEAWAY' ? 'Takeaway' : 'Table ' + (order.restaurantTable?.name || '?')})
                    </span>
                </p>
                <p className="text-xs text-gray-400">
                    {order.items?.length || 0} items • <span className="font-semibold">{order.status}</span>
                </p>
            </div>
            <div className="text-right">
                <p className="text-yellow-400 font-bold text-sm">${order.totalAmount}</p>
                <p className="text-[10px] text-gray-500">
                    {order.orderDate ? new Date(order.orderDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                </p>
            </div>
        </div>
    );

    return (
        <div className=" mx-auto p-4 md:p-6 text-white min-h-screen font-sans">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">
                        Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">{user?.name || 'Staff'}</span>
                    </h1>
                    <p className="text-lg text-gray-400">Restauron Operational Command Center</p>
                </div>
                
                {/* Status Indicator */}
                <div className="flex gap-3">
                    <div className="px-4 py-2 rounded-full bg-gray-900 border border-gray-800 flex items-center gap-2 shadow-lg">
                        <div className={`w-2 h-2 rounded-full ${notifications.length > 0 ? 'bg-blue-500 animate-ping' : 'bg-green-500'}`} />
                        <span className="text-sm font-medium text-gray-300">Live Updates Active</span>
                    </div>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Operational Actions (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ActionCard
                            icon={Utensils}
                            title="New Order (POS)"
                            description="Open the Point of Sale terminal to create Dine-in or Takeaway orders."
                            path="/employee/pos"
                            color="yellow"
                        />
                        <ActionCard
                            icon={ChefHat}
                            title="Kitchen Display"
                            description="View active tickets, manage cooking status, and track prep times."
                            path="/employee/kitchen"
                            color="blue"
                        />
                        <ActionCard
                            icon={LayoutGrid}
                            title="Table Management"
                            description="Visual floor plan to seat guests and track table occupancy."
                            path="/employee/tables"
                            color="yellow"
                        />
                        <ActionCard
                            icon={ShoppingBag}
                            title="Order History"
                            description="Search past orders, process refunds, or reprint receipts."
                            path="/employee/orders/history"
                            color="gray"
                        />
                    </div>

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <button onClick={() => navigate(`/employee/profile/${user.specialId}`)} className="p-4 rounded-xl bg-gray-900/30 border border-gray-800 hover:bg-gray-800 transition text-center group">
                            <User className="mx-auto mb-2 text-gray-400 group-hover:text-white" size={20} />
                            <span className="text-xs font-bold text-gray-500 group-hover:text-gray-300">Profile</span>
                        </button>
                    
                    </div>
                </div>

                {/* Right Column: Live Feed / Pulse (1/3 width) */}
                <div className="space-y-6">
                    
                    {/* Live Stats Widget */}
                    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-xl p-6 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Activity size={100} /></div>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="text-yellow-500" size={20} /> Live Pulse
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 backdrop-blur-sm">
                                <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Pending</p>
                                <p className="text-3xl font-extrabold text-white mt-1">{loading ? '-' : stats.pendingOrders}</p>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 backdrop-blur-sm">
                                <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Occupied</p>
                                <p className="text-3xl font-extrabold text-white mt-1">{loading ? '-' : stats.activeTables}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 h-[400px] flex flex-col">
                        <h2 className="text-lg font-bold text-white mb-4 flex justify-between items-center">
                            Recent Orders
                            {loading && <span className="text-xs font-normal text-yellow-500 animate-pulse">Syncing...</span>}
                        </h2>
                        
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {loading ? (
                                <div className="text-center text-gray-600 mt-10 animate-pulse">Loading feed...</div>
                            ) : recentOrders.length === 0 ? (
                                <div className="text-center text-gray-600 mt-10 flex flex-col items-center">
                                    <Clock size={32} className="mb-2 opacity-20" />
                                    <span className="text-sm">No active orders</span>
                                </div>
                            ) : (
                                recentOrders.map((order) => (
                                    <ActivityItem key={order.id || order.billNumber} order={order} />
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
