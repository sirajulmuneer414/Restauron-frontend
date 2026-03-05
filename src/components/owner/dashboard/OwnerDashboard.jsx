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
    BarChart3
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
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), #374151)' }}>
            <Toaster />

            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Owner Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-1">Overview of your restaurant's performance</p>
                </div>
                <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-800 text-sm text-gray-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Today: <span className="font-semibold text-white">{new Date().toLocaleDateString()}</span></span>
                </div>
            </div>

            {/* KEY METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Today's Sales" value={`₹${(sales.today || 0).toFixed(2)}`} icon={<IndianRupee className="text-green-400" size={24} />} trend="Daily Revenue" colorClass="bg-green-500/10 text-green-400" />
                <StatCard title="Weekly Sales" value={`₹${(sales.week || 0).toFixed(2)}`} icon={<TrendingUp className="text-blue-400" size={24} />} trend="Last 7 Days" colorClass="bg-blue-500/10 text-blue-400" />
                <StatCard title="Monthly Sales" value={`₹${(sales.month || 0).toFixed(2)}`} icon={<ShoppingBag className="text-purple-400" size={24} />} trend="Current Month" colorClass="bg-purple-500/10 text-purple-400" />
                <StatCard title="Active Staff" value={employeeCount} icon={<Users className="text-orange-400" size={24} />} trend="Total Employees" colorClass="bg-orange-500/10 text-orange-400" />
            </div>

            {/* SALES REPORT SECTION */}
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

// --- SALES ANALYTICS SECTION ---
const SalesAnalyticsSection = ({ ownerService }) => {
    const [filterType, setFilterType] = useState('DAILY');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
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

    return (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">

            {/* Header and Filter Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Sales Analytics</h2>
                        <p className="text-xs text-gray-500">Revenue breakdown over time</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-black/40 p-1 rounded-lg border border-gray-800">
                    {['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${filterType === type
                                    ? 'bg-yellow-500 text-black shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center text-gray-500 text-sm">Loading Chart...</div>
            ) : (
                <>
                    {/* Summary Row */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                            <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                            <p className="text-xl font-bold text-white">₹{(reportData?.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                            <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                            <p className="text-xl font-bold text-white">{reportData?.totalOrders || 0}</p>
                        </div>
                        <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                            <p className="text-xs text-gray-500 mb-1">Avg Order Value</p>
                            <p className="text-xl font-bold text-white">₹{(reportData?.averageOrderValue || 0).toFixed(0)}</p>
                        </div>
                    </div>

                    {/* Chart Visuals */}
                    <div className="h-64 flex items-end gap-1">
                        {reportData?.chartData?.length > 0 ? (
                            reportData.chartData.map((point, idx) => {
                                const heightPercentage = maxVal > 0 ? (point.value / maxVal) * 100 : 0;
                                return (
                                    <div key={idx} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-max">
                                            <div className="bg-gray-900 border border-gray-700 text-white text-xs py-1 px-2 rounded shadow-lg text-center">
                                                ₹{point.value} <br />
                                                <span className="text-gray-400">{point.date}</span>
                                            </div>
                                        </div>

                                        {/* Bar */}
                                        <div
                                            className={`w-full rounded-t transition-all duration-300 ${point.value > 0 ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-gray-800 hover:bg-gray-700'}`}
                                            style={{ height: `${Math.max(point.value > 0 ? heightPercentage : 4, 4)}%` }}
                                        ></div>

                                        {/* Label */}
                                        <span className="text-[10px] text-gray-500 mt-2 truncate w-full text-center h-4">
                                            {reportData.chartData.length < 15 ? point.label : (idx % 3 === 0 ? point.label : '')}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                No sales data found for this period.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// --- Helper Components ---

const RecentOrdersTable = ({ orders }) => (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Recent Orders</h2>
            <Link to="/owner/orders" className="text-yellow-400 text-sm font-medium hover:text-yellow-300 flex items-center gap-1">
                View All <ArrowRight size={16} />
            </Link>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-black/30 text-xs uppercase font-semibold text-gray-500 border-b border-gray-800">
                    <tr>
                        <th className="px-6 py-4">Bill No</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                    {orders.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No orders found for today.</td></tr>
                    ) : (
                        orders.map((order) => (
                            <tr key={order.encryptedOrderId} className="hover:bg-gray-800/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-yellow-400">#{order.billNumber}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{order.customerName || "Guest"}</div>
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                                <td className="px-6 py-4 font-medium text-green-400">₹{(order.totalAmount || 0).toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        to={`/owner/orders/${order.encryptedOrderId}`}
                                        className="text-yellow-400 hover:text-yellow-300 font-medium text-xs border border-yellow-500/30 px-3 py-1.5 rounded hover:bg-yellow-500/10 transition-colors"
                                    >
                                        View
                                    </Link>
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
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400 border border-yellow-500/20"><CreditCard size={20} /></div>
            <h2 className="text-lg font-bold text-white">Current Plan</h2>
        </div>
        {(!subscription || subscription.status !== 'ACTIVE') ? (
            <div className="text-center py-2">
                <div className="bg-red-500/10 text-red-400 border border-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
                <h3 className="text-lg font-bold text-white mb-2">No Active Plan</h3>
                <Link to="/owner/subscription" className="block w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-lg text-center transition-colors">View Plans</Link>
            </div>
        ) : (
            <div>
                <div className="flex justify-between items-end mb-3">
                    <span className="text-2xl font-bold text-white">{subscription.planName}</span>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${subscription.daysLeft <= 5 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                        {subscription.daysLeft} days left
                    </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
                    <div className={`h-2.5 rounded-full ${subscription.daysLeft <= 5 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min((subscription.daysLeft / 30) * 100, 100)}%` }}></div>
                </div>
                <Link to="/owner/subscription" className="block w-full text-center py-2 border border-gray-700 rounded-lg text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">Manage Subscription</Link>
            </div>
        )}
    </div>
);

const TopItemsCard = ({ topItems }) => (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Top Selling Dishes</h2>
        <div className="space-y-1">
            {topItems.length === 0
                ? <p className="text-sm text-gray-500 text-center py-6">No sales data.</p>
                : topItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-800/40 rounded-lg group transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-400'}`}>{index + 1}</div>
                            <div>
                                <p className="font-medium text-gray-200 text-sm group-hover:text-yellow-400 transition-colors">{item.name || item.itemName}</p>
                                <p className="text-xs text-gray-500">{item.count || item.totalOrders} sold</p>
                            </div>
                        </div>
                        <span className="font-semibold text-gray-300 text-sm">₹{(item.revenue || item.totalRevenue || 0).toFixed(0)}</span>
                    </div>
                ))
            }
        </div>
    </div>
);

const StatCard = ({ title, value, icon, trend, colorClass }) => (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 flex items-start justify-between hover:border-gray-700 transition-all duration-200">
        <div>
            <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
            <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{value}</h3>
            <p className="text-xs text-gray-500 font-medium">{trend}</p>
        </div>
        <div className={`p-3 rounded-xl border border-opacity-20 ${colorClass}`}>{icon}</div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        COMPLETED: "bg-green-500/10 text-green-400 border-green-500/30",
        PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
        CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
        PREPARING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        READY: "bg-teal-500/10 text-teal-400 border-teal-500/30"
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || "bg-gray-800 text-gray-400 border-gray-700"}`}>{status}</span>;
};

export default OwnerDashboard;
