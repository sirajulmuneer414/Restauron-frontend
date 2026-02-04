import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
    IndianRupee,
    Users,
    CreditCard,
    ShoppingBag,
    ArrowRight,
    TrendingUp,
    AlertTriangle,
    BarChart3,
    Calendar,
    Filter
} from 'lucide-react';

import { useOwnerService } from '../../../services/ownerService';
import RestaurantQRCodeCard from '../dashboard/RestaurantQRCodeCard';

const OwnerDashboard = () => {
    const ownerService = useOwnerService();

    const [loading, setLoading] = useState(true);
    const [sales, setSales] = useState({ today: 0, week: 0, month: 0, year: 0 });
    const [subscription, setSubscription] = useState(null);
    const [orders, setOrders] = useState([]);
    const [employeeCount, setEmployeeCount] = useState(0);
    const [topItems, setTopItems] = useState([]);
    const [restaurantLink, setRestaurantLink] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [salesData, subData, ordersData, empData, itemsData, linkData] = await Promise.all([
                ownerService.getSalesStats(),
                ownerService.getSubscriptionStatus(),
                ownerService.getRecentOrders(),
                ownerService.getEmployeeCount(),
                ownerService.getTopItems(),
                ownerService.getRestaurantCustomerLink()
            ]);

            setSales(salesData || { today: 0, week: 0, month: 0, year: 0 });
            setSubscription(subData);
            setOrders(ordersData || []);
            setEmployeeCount(empData || 0);
            setTopItems(itemsData || []);
            setRestaurantLink(linkData);

            if (subData && subData.status === 'ACTIVE' && subData.daysLeft <= 5) {
                toast('Reminder: Subscription expires in ' + subData.daysLeft + ' days!', {
                    icon: '⚠️',
                });
            }
        } catch (error) {
            console.error("Error loading dashboard", error);
            toast.error("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <Toaster />
            
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Overview of your restaurant's performance</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Today: <span className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</span></span>
                </div>
            </div>

            {/* KEY METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Today's Sales" value={`₹${(sales.today || 0).toFixed(2)}`} icon={<IndianRupee className="text-green-600" size={24} />} trend="Daily Revenue" color="bg-green-50 text-green-600" />
                <StatCard title="Weekly Sales" value={`₹${(sales.week || 0).toFixed(2)}`} icon={<TrendingUp className="text-blue-600" size={24} />} trend="Last 7 Days" color="bg-blue-50 text-blue-600" />
                <StatCard title="Monthly Sales" value={`₹${(sales.month || 0).toFixed(2)}`} icon={<ShoppingBag className="text-purple-600" size={24} />} trend="Current Month" color="bg-purple-50 text-purple-600" />
                <StatCard title="Active Staff" value={employeeCount} icon={<Users className="text-orange-600" size={24} />} trend="Total Employees" color="bg-orange-50 text-orange-600" />
            </div>

            {/* NEW: SALES REPORT SECTION */}
            <div className="mb-8">
                <SalesAnalyticsSection ownerService={ownerService} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: RECENT ORDERS */}
                <div className="lg:col-span-2 space-y-8">
                    <RecentOrdersTable orders={orders} />
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-8">
                    {restaurantLink && <RestaurantQRCodeCard restaurantLink={restaurantLink} />}
                    <SubscriptionCard subscription={subscription} />
                    <TopItemsCard topItems={topItems} />
                </div>
            </div>
        </div>
    );
};

// --- NEW COMPONENT: Sales Analytics Section ---
const SalesAnalyticsSection = ({ ownerService }) => {
    const [filterType, setFilterType] = useState('DAILY'); // DAILY, WEEKLY, MONTHLY, YEARLY
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                // Call the new service method here
                const data = await ownerService.getSalesReport(filterType);
                setReportData(data);
            } catch (error) {
                console.error("Error fetching report", error);
                toast.error("Could not load sales report");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [filterType, ownerService]);

    const maxVal = reportData?.chartData ? Math.max(...reportData.chartData.map(d => d.value)) : 0;

   // inside SalesAnalyticsSection component

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* ... Header and Tabs code remains same ... */}

            {loading ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading Chart...</div>
            ) : (
                <>
                    {/* Summary Row */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {/* ... Summary cards remain same ... */}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                           <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                           <p className="text-xl font-bold text-gray-900">₹{(reportData?.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                        {/* ... other 2 cards ... */}
                    </div>

                    {/* FIXED CHART VISUALS */}
                    <div className="h-64 flex items-end gap-1"> {/* CHANGED: gap-2 to gap-1, removed justify-between */}
                        {reportData?.chartData?.length > 0 ? (
                            reportData.chartData.map((point, idx) => {
                                const heightPercentage = maxVal > 0 ? (point.value / maxVal) * 100 : 0;
                                return (
                                    <div key={idx} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                                        
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-max">
                                            <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg text-center">
                                                ₹{point.value} <br/> 
                                                <span className="text-gray-400">{point.date}</span>
                                            </div>
                                        </div>

                                        {/* Bar */}
                                        <div 
                                            className={`w-full rounded-t transition-all duration-300 relative ${point.value > 0 ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-50 hover:bg-indigo-100'}`}
                                            style={{ height: `${point.value > 0 ? heightPercentage : 4}%` }} 
                                        ></div>

                                        {/* Label */}
                                        {/* Only show label for every 3rd item if there are too many items, else show all */}
                                        <span className="text-[10px] text-gray-400 mt-2 truncate w-full text-center h-4">
                                            {reportData.chartData.length > 20 && idx % 3 !== 0 ? '' : point.label}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                No sales data found for this period.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// --- Refactored Components for Cleanliness ---

const RecentOrdersTable = ({ orders }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <Link to="/owner/orders" className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center gap-1">
                View All <ArrowRight size={16} />
            </Link>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                    <tr>
                        <th className="px-6 py-4">Bill No</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {orders.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No orders found for today.</td></tr>
                    ) : (
                        orders.map((order) => (
                            <tr key={order.encryptedOrderId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">#{order.billNumber}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{order.customerName || "Guest"}</div>
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                                <td className="px-6 py-4 font-medium text-gray-900">₹{(order.totalAmount || 0).toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    <Link to={`/owner/orders/${order.encryptedOrderId}`} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs border border-indigo-200 px-3 py-1.5 rounded hover:bg-indigo-50">View</Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const SubscriptionCard = ({ subscription }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><CreditCard size={20} /></div>
            <h2 className="text-lg font-bold text-gray-800">Current Plan</h2>
        </div>
        {(!subscription || subscription.status !== 'ACTIVE') ? (
            <div className="text-center py-2">
                <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No Active Plan</h3>
                <Link to="/owner/subscription" className="block w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg text-center">View Plans</Link>
            </div>
        ) : (
            <div>
                 <div className="flex justify-between items-end mb-3">
                    <span className="text-2xl font-bold text-gray-900">{subscription.planName}</span>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${subscription.daysLeft <= 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                        {subscription.daysLeft} days left
                    </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                    <div className={`h-2.5 rounded-full ${subscription.daysLeft <= 5 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${Math.min((subscription.daysLeft / 30) * 100, 100)}%` }}></div>
                </div>
                <Link to="/owner/subscription" className="block w-full text-center py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Manage Subscription</Link>
            </div>
        )}
    </div>
);

const TopItemsCard = ({ topItems }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Top Selling Dishes</h2>
        <div className="space-y-1">
            {topItems.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No sales data.</p> : topItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{index + 1}</div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm group-hover:text-indigo-600">{item.name || item.itemName}</p>
                            <p className="text-xs text-gray-500">{item.count || item.totalOrders} sold</p>
                        </div>
                    </div>
                    <span className="font-semibold text-gray-700 text-sm">₹{(item.revenue || item.totalRevenue || 0).toFixed(0)}</span>
                </div>
            ))}
        </div>
    </div>
);

const StatCard = ({ title, value, icon, trend, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-all duration-200">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">{value}</h3>
            <p className="text-xs text-gray-400 font-medium">{trend}</p>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>{icon}</div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = { COMPLETED: "bg-green-100 text-green-700", PENDING: "bg-yellow-100 text-yellow-800", CANCELLED: "bg-red-100 text-red-700", PREPARING: "bg-blue-100 text-blue-700", READY: "bg-indigo-100 text-indigo-700" };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
};

export default OwnerDashboard;
