import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAxios } from '../../../axios/instances/axiosInstances';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, Table } from 'lucide-react';
import { Button } from '../../ui/button';

// --- Component ---
const OwnerOrderDetailPage = () => {
    const { orderId } = useParams(); // Gets the ID from the URL
    const navigate = useNavigate();
    const { axiosOwnerInstance } = useAxios();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch order details on component mount
    useEffect(() => {
        const fetchDetails = async () => {
            if (!orderId) return;
            try {
                setIsLoading(true);
                // Endpoint to get details
                const response = await axiosOwnerInstance.get(`/owner/orders/detail/${orderId}`);
                setOrder(response.data);
            } catch (err) {
                toast.error("Failed to fetch order details.");
                setError("Could not load order details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [orderId, axiosOwnerInstance]);

    // Handle status change
    const handleStatusChange = async (newStatus) => {
        if (!orderId || !order) return;
        
        const originalStatus = order.status;
        setOrder({ ...order, status: newStatus }); // Optimistic update

        try {
            // Endpoint to update status
            await axiosOwnerInstance.patch(`/owner/orders/status/${orderId}?status=${newStatus}`);
            toast.success("Order status updated!");
        } catch (err) {
            setOrder({ ...order, status: originalStatus }); // Revert on failure
            toast.error("Failed to update status.");
        }
    };

    // Handle order deletion
    const handleDeleteOrder = async () => {
        if (!orderId) return;
        
        if (window.confirm("Are you sure you want to delete this order permanently?")) {
            try {
                // Endpoint to delete order
                await axiosOwnerInstance.delete(`/owner/orders/${orderId}`);
                toast.success("Order deleted successfully.");
                navigate('/owner/orders'); // Go back to the list
            } catch (err) {
                toast.error("Failed to delete order.");
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center text-white">Loading order details...</div>;
    if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
    if (!order) return <div className="p-8 text-center text-white">Order not found.</div>;

    return (
        <div className="p-4 md:p-8 text-white">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <Button onClick={() => navigate('/owner/orders')} className="bg-transparent hover:bg-gray-800 p-2 mb-2">
                        <ArrowLeft size={20} /> <span className="ml-2">Back to Orders</span>
                    </Button>
                    <h1 className="text-3xl font-bold">Order: {order.billNumber}</h1>
                    
                    {/* Displays correct name (registered or temporary) */}
                    <p className="text-gray-400">Customer: {order.customerName} ({order.customerPhone})</p>
                    
                    {/* Displays table name if it exists */}
                    {order.restaurantTableName && (
                        <p className="text-yellow-400 flex items-center gap-2 mt-1">
                            <Table size={16} /> {order.restaurantTableName}
                        </p>
                    )}
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleDeleteOrder} className="bg-red-600/80 hover:bg-red-600 text-white font-semibold">
                        <Trash2 size={16} className="mr-2" /> Delete
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Items */}
                <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">Items</h2>
                    <ul className="divide-y divide-gray-700">
                        {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center py-3">
                                <div>
                                    <p className="font-semibold">{item.menuItemName}</p>
                                    <p className="text-sm text-gray-400">{item.quantity} x ₹{item.priceAtOrder.toFixed(2)}</p>
                                </div>
                                <p className="font-mono text-lg">₹{item.itemTotal.toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-yellow-500/50 pt-4 mt-4 flex justify-between items-center">
                        <p className="text-xl font-bold">Total</p>
                        <p className="text-2xl font-bold font-mono">₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                </div>

                {/* Order Status & Info */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 self-start">
                    <h2 className="text-xl font-bold mb-4">Details</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-gray-400">Status</label>
                            <select 
                                value={order.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full mt-1 bg-black/70 border border-gray-700 rounded-lg px-3 py-2.5 focus:outline-none focus:border-yellow-500"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PREPARING">Preparing</option>
                                <option value="READY">Ready</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Order Type</p>
                            <p className="font-semibold">{order.orderType}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Payment Mode</p>
                            <p className="font-semibold">{order.paymentMode}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-400">Order Placed</p>
                            <p className="font-semibold">{new Date(order.orderDate).toLocaleDateString()} at {order.orderTime}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerOrderDetailPage;