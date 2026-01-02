import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, ChefHat, CheckCircle, Package } from 'lucide-react';
import { useCustomerService } from '../../services/customerService';
import { useWebSocket } from '../../hooks/useWebSocket';
import StatusBadge from '../../components/customer/StatusBadge';
import RatingModal from '../../components/customer/RatingModal';
import toast from 'react-hot-toast';

const CustomerOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const customerService = useCustomerService();
  const { isConnected, subscribeToOrder, unsubscribeFromOrder } = useWebSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, item: null });

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Setup WebSocket subscription for this order
  useEffect(() => {
    if (!orderId || !isConnected) return;

    // Subscribe to order updates
    const subscription = subscribeToOrder(orderId, (updatedOrder) => {
      console.log('Order status updated via WebSocket:', updatedOrder);
      
      // Update the order status in state
      setOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: updatedOrder.status || updatedOrder.orderStatus || prev.status,
        };
      });

      // Show toast notification
      const statusLabel = updatedOrder.status || updatedOrder.orderStatus;
      toast.success(`Order status updated: ${statusLabel}`, {
        icon: '🔔',
        duration: 4000,
      });
    });

    // Cleanup: unsubscribe when component unmounts or orderId changes
    return () => {
      if (orderId) {
        unsubscribeFromOrder(orderId);
      }
    };
  }, [orderId, isConnected]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await customerService.getOrderDetails(orderId);
      setOrder(data);
    } catch (error) {
      toast.error('Failed to load order details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateItem = async (ratingData) => {
    try {
      await customerService.submitRating(
        orderId,
        ratingModal.item.encryptedMenuItemId,
        ratingData
      );
      toast.success('Rating submitted successfully!');
      setRatingModal({ isOpen: false, item: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
      throw error; // Re-throw so modal can handle it
    }
  };

  const statusSteps = [
    { status: 'PENDING', label: 'Order Placed', icon: Clock },
    { status: 'PREPARING', label: 'Preparing', icon: ChefHat },
    { status: 'READY', label: 'Ready', icon: Package },
    { status: 'COMPLETED', label: 'Completed', icon: CheckCircle },
  ];

  const getStepIndex = (status) => {
    return statusSteps.findIndex((step) => step.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
          <p className="text-zinc-400 mt-4">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Order not found</p>
          <button
            onClick={() => navigate('/customer/orders')}
            className="mt-4 px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/customer/orders')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>

        {/* WebSocket Status Indicator */}
        {isConnected && (
          <div className="mb-4 flex items-center gap-2 text-xs text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live updates enabled
          </div>
        )}

        {/* Order Info Card */}
        <div className="bg-linear-to-br from-zinc-900/80 to-black/60 border border-amber-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-white mb-2">
                Order #{order.billNumber}
              </h1>
              <p className="text-zinc-400">{order.restaurantName}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-500/10">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Order Type</p>
              <p className="text-white font-semibold">{order.orderType}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Total Amount</p>
              <p className="text-white font-semibold">₹{order.totalAmount.toFixed(2)}</p>
            </div>
            {order.tableName && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Table</p>
                <p className="text-white font-semibold">{order.tableName}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-zinc-500 mb-1">Order Time</p>
              <p className="text-white font-semibold">
                {new Date(order.orderDate).toLocaleDateString()} {order.orderTime}
              </p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-linear-to-br from-zinc-900/80 to-black/60 border border-amber-500/20 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-6">Order Status</h2>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-800">
              <div
                className="h-full bg-linear-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-amber-500 border-amber-500 text-black'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                      } ${isCurrent ? 'ring-4 ring-amber-500/20 scale-110' : ''}`}
                    >
                      <Icon size={18} />
                    </div>
                    <p
                      className={`mt-2 text-xs font-semibold transition-colors ${
                        isCompleted ? 'text-white' : 'text-zinc-500'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-linear-to-br from-zinc-900/80 to-black/60 border border-amber-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.encryptedMenuItemId}
                className="flex items-center justify-between p-4 bg-black/40 border border-amber-500/10 rounded-xl"
              >
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{item.menuItemName}</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Qty: {item.quantity} × ₹{item.priceAtOrder.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    ₹{(item.quantity * item.priceAtOrder).toFixed(2)}
                  </p>
                  {order.status === 'COMPLETED' && (
                    <button
                      onClick={() => setRatingModal({ isOpen: true, item })}
                      className="mt-2 flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/10 
                               border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 
                               transition-colors text-xs font-semibold"
                    >
                      <Star size={14} />
                      Rate Item
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, item: null })}
        menuItem={ratingModal.item}
        onSubmit={handleRateItem}
      />
    </div>
  );
};

export default CustomerOrderDetailPage;

