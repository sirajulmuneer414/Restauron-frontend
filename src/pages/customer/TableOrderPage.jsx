import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tableOrderService } from '../../services/tableOrderService';
import { ShoppingCart, Plus, Minus, Trash2, User, Phone, MessageSquare, Leaf, X, Check } from 'lucide-react';
import CommonLoadingSpinner from '../../components/loadingAnimations/CommonLoading';
import toast from 'react-hot-toast';

const TableOrderPage = () => {
    const { restaurantId, tableId } = useParams();

    // State management
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderConfirmation, setOrderConfirmation] = useState(null);

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        fetchTableData();
    }, [tableId]);

    const fetchTableData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await tableOrderService.getTableOrderInfo(tableId);
            setData(response);
            if (response.menuCategories.length > 0) {
                setSelectedCategory(response.menuCategories[0].encryptedId);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to load menu. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        const existing = cart.find(i => i.encryptedId === item.encryptedId);
        if (existing) {
            setCart(cart.map(i =>
                i.encryptedId === item.encryptedId
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
        toast.success(`${item.name} added to cart`);
    };

    const updateQuantity = (itemId, change) => {
        setCart(cart.map(i => {
            if (i.encryptedId === itemId) {
                const newQty = i.quantity + change;
                return newQty > 0 ? { ...i, quantity: newQty } : i;
            }
            return i;
        }).filter(i => i.quantity > 0));
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(i => i.encryptedId !== itemId));
    };

    const getTotalAmount = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handlePlaceOrder = async () => {
        if (!customerName.trim()) {
            toast.error('Please enter your name');
            return;
        }
        if (!customerPhone.trim() || customerPhone.length !== 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }
        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setSubmitting(true);
        try {
            const orderData = {
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                customerRemarks: remarks.trim() || null,
                items: cart.map(item => ({
                    encryptedMenuItemId: item.encryptedId,
                    quantity: item.quantity
                }))
            };

            const response = await tableOrderService.placeTableOrder(tableId, orderData);
            setOrderConfirmation(response);
            setOrderPlaced(true);
            setCart([]);
            toast.success('Order placed successfully!');
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to place order. Please try again.';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <CommonLoadingSpinner />;

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
                <div className="bg-gray-900/60 border border-red-500/30 rounded-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-500/20 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="text-red-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Menu</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={fetchTableData}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (orderPlaced && orderConfirmation) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
                <div className="bg-gray-900/60 border border-green-500/30 rounded-xl p-8 max-w-md w-full">
                    <div className="w-20 h-20 bg-green-500/20 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="text-green-400" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white text-center mb-2">Order Placed!</h2>
                    <p className="text-gray-400 text-center mb-6">Your order has been sent to the kitchen</p>

                    <div className="bg-black/30 border border-gray-800 rounded-lg p-4 mb-6 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Order Number</span>
                            <span className="text-white font-semibold">{orderConfirmation.billNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Total Amount</span>
                            <span className="text-white font-semibold">₹{orderConfirmation.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Payment Method</span>
                            <span className="text-yellow-400 font-semibold">Cash</span>
                        </div>
                    </div>

                    <p className="text-center text-gray-300 mb-6">{orderConfirmation.message}</p>

                    <button
                        onClick={() => {
                            setOrderPlaced(false);
                            setOrderConfirmation(null);
                            setCustomerName('');
                            setCustomerPhone('');
                            setRemarks('');
                        }}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                        Place Another Order
                    </button>
                </div>
            </div>
        );
    }

    const currentCategory = data?.menuCategories.find(c => c.encryptedId === selectedCategory);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-yellow-400">{data?.restaurant.name}</h1>
                    <p className="text-gray-400 text-sm">
                        {data?.table.name} • Capacity: {data?.table.capacity} seats
                    </p>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="bg-gray-900/50 border-b border-gray-800 sticky top-[72px] z-10">
                <div className="container mx-auto px-4 py-3 overflow-x-auto">
                    <div className="flex gap-2">
                        {data?.menuCategories.map(category => (
                            <button
                                key={category.encryptedId}
                                onClick={() => setSelectedCategory(category.encryptedId)}
                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${selectedCategory === category.encryptedId
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Items Grid */}
            <div className="container mx-auto px-4 py-6 pb-32">
                {currentCategory && (
                    <>
                        {currentCategory.description && (
                            <p className="text-gray-400 mb-6">{currentCategory.description}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentCategory.items.map(item => (
                                <div
                                    key={item.encryptedId}
                                    className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500/50 transition-colors"
                                >
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                                            {item.isVegetarian && (
                                                <Leaf className="text-green-400 flex-shrink-0" size={18} />
                                            )}
                                        </div>
                                        {item.description && (
                                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-yellow-400">₹{item.price.toFixed(2)}</span>
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                            >
                                                <Plus size={16} /> Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!currentCategory && data?.menuCategories.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No menu items available at the moment.</p>
                    </div>
                )}
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <button
                    onClick={() => setShowCart(true)}
                    className="fixed bottom-6 right-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-4 rounded-full shadow-2xl shadow-yellow-500/30 flex items-center gap-3 z-20 transition-colors"
                >
                    <ShoppingCart size={24} />
                    <span>{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</span>
                    <span>₹{getTotalAmount().toFixed(2)}</span>
                </button>
            )}

            {/* Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center">
                    <div className="bg-gray-900 border border-gray-800 w-full md:max-w-2xl md:rounded-xl max-h-[90vh] overflow-y-auto">
                        {/* Cart Header */}
                        <div className="bg-black/40 p-4 sticky top-0 flex items-center justify-between border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white">Your Order</h2>
                            <button
                                onClick={() => setShowCart(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="p-4 space-y-3">
                            {cart.map(item => (
                                <div key={item.encryptedId} className="bg-black/30 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white">{item.name}</h3>
                                        <p className="text-yellow-400 font-bold">₹{item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.encryptedId, -1)}
                                            className="bg-gray-800 hover:bg-gray-700 p-2 rounded transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="font-bold w-8 text-center text-white">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.encryptedId, 1)}
                                            className="bg-gray-800 hover:bg-gray-700 p-2 rounded transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(item.encryptedId)}
                                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded ml-2 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Customer Details Form */}
                        <div className="p-4 bg-black/20 border-t border-gray-800 space-y-3">
                            <h3 className="font-semibold text-white mb-3">Your Details</h3>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all text-white placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Phone Number *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="10-digit mobile number"
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all text-white placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Special Requests (Optional)</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Any special instructions?"
                                        rows={3}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all text-white placeholder-gray-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cart Footer */}
                        <div className="p-4 bg-black/40 border-t border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-lg font-semibold text-white">Total Amount</span>
                                <span className="text-2xl font-bold text-yellow-400">₹{getTotalAmount().toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={submitting}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-colors"
                            >
                                {submitting ? 'Placing Order...' : 'Place Order (Cash Payment)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableOrderPage;
