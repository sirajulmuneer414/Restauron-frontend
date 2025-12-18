import React from 'react';
import { X, CheckCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NewOrderModal = ({ order, onClose }) => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.userSlice?.user);

    if (!order) return null;

    const handleViewOrder = () => {
        onClose();
        if(user.role.toLowerCase() === 'employee') {
            navigate(`/employee/orders/${order.orderId}`);
            return;
        }
        if(user.role.toLowerCase() === 'admin') {
            navigate(`/admin/orders/${order.orderId}`);
            return;
        }

        return;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-bounceIn">
                
                {/* Header */}
                <div className="bg-green-600 p-4 flex justify-between items-center text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <CheckCircle size={24} /> New Order Received!
                    </h3>
                    <button onClick={onClose} className="hover:bg-green-700 p-1 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                    <div className="text-4xl font-extrabold text-gray-800 mb-2">
                        #{order.orderId}
                    </div>
                    <p className="text-gray-500 mb-4">Table No: <span className="font-bold text-gray-800">{order.tableNumber}</span></p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-100">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Items Summary:</p>
                        <ul className="text-sm text-gray-800 space-y-1">
                            {/* Assuming backend sends a summary string or list */}
                            {order.itemsSummary ? (
                                <li className="line-clamp-3">{order.itemsSummary}</li>
                            ) : (
                                <li>{order.itemCount} Items</li>
                            )}
                        </ul>
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-bold">
                            <span>Total Amount:</span>
                            <span className="text-green-600">₹{order.totalAmount}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                        >
                            Dismiss
                        </button>
                        <button 
                            onClick={handleViewOrder}
                            className="flex-1 py-3 px-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition flex items-center justify-center gap-2"
                        >
                            <Eye size={20} /> View Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewOrderModal;
