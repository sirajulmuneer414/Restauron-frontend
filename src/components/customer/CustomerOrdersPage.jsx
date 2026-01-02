import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCustomerService } from '../../services/customerService';
import StatusBadge from '../../components/customer/StatusBadge';
import toast from 'react-hot-toast';

const CustomerOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'COMPLETED'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const customerService = useCustomerService();

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await customerService.getCustomerOrders(activeTab);
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const OrderCard = ({ order }) => (
    <div
      onClick={() => navigate(`/customer/orders/${order.encryptedOrderId}`)}
      className="group bg-linear-to-br from-zinc-900/80 to-black/60 border border-amber-500/10 
                 rounded-2xl p-6 hover:border-amber-500/30 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-bold text-lg">#{order.billNumber}</h3>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-zinc-400 text-sm">{order.restaurantName}</p>
        </div>
        <ArrowRight
          className="text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
          size={20}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-500/10">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Total Amount</p>
          <p className="text-white font-semibold">₹{order.totalAmount.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Items</p>
          <p className="text-white font-semibold">{order.itemCount} items</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-zinc-500 mb-1">Order Date</p>
          <p className="text-zinc-300 text-sm">
            {new Date(order.orderDate).toLocaleDateString()} at {order.orderTime}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black bg-linear-to-r from-white to-amber-200 bg-clip-text text-transparent mb-2">
            My Orders
          </h1>
          <p className="text-zinc-400">Track your orders and leave reviews</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-zinc-900/50 p-1 rounded-xl border border-amber-500/10">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ACTIVE'
                ? 'bg-amber-500 text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock size={18} />
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'COMPLETED'
                ? 'bg-amber-500 text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package size={18} />
            Order History
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
            <p className="text-zinc-400 mt-4">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
              <ShoppingBag className="text-amber-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No orders found</h3>
            <p className="text-zinc-400">
              {activeTab === 'ACTIVE'
                ? "You don't have any active orders"
                : "You haven't completed any orders yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <OrderCard key={order.encryptedOrderId} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrdersPage;
