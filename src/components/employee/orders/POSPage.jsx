import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Search,
    User,
    Phone,
    ShoppingBag,
    UtensilsCrossed,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Banknote,
    Lock,
    ChefHat,
    TableProperties
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmployeeService } from '../../../services/employeeService';

const POSPage = () => {
    const user = useSelector((state) => state.userSlice?.user);
    const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';
    const employeeService = useEmployeeService();

    const [menuItems, setMenuItems] = useState([]);
    const [tables, setTables] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState({ encryptedCategoryId: 'All', name: 'All' });

    const [orderSettings, setOrderSettings] = useState({
        orderType: 'DINE_IN',
        paymentMode: 'CASH',
        tableId: '',
    });

    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });

    // --- INITIAL LOAD ---
    useEffect(() => { fetchInitialData(); }, []);

    // --- SEARCH DEBOUNCE ---
    useEffect(() => {
        const delay = setTimeout(() => { fetchMenu(); }, 400);
        return () => clearTimeout(delay);
    }, [searchQuery, selectedCategory]);

    const fetchInitialData = async () => {
        try {
            const [tablesData, categoriesData] = await Promise.all([
                employeeService.getAllTables(),
                employeeService.getAllCategories(),
            ]);
            // Only show AVAILABLE tables in the dropdown
            setTables(tablesData.filter(t => t.status === 'AVAILABLE'));
            setCategories([{ encryptedCategoryId: 'All', name: 'All' }, ...categoriesData]);
        } catch {
            toast.error('Failed to load initial data.');
        }
    };

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const data = await employeeService.searchMenu(searchQuery, selectedCategory.name, 0, 100);
            setMenuItems(data.content || []);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    // --- CART LOGIC ---
    const addToCart = (item) => {
        if (isReadOnly) return;
        setCart(prev => {
            const existing = prev.find(i => i.encryptedId === item.encryptedId);
            if (existing) return prev.map(i => i.encryptedId === item.encryptedId ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { ...item, quantity: 1 }];
        });
        toast.success(`Added ${item.name}`, { duration: 1200 });
    };

    const updateQuantity = (itemId, delta) => {
        setCart(prev =>
            prev.map(item => item.encryptedId === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
                .filter(item => item.quantity > 0)
        );
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // --- SUBMIT ORDER ---
    const submitOrder = async () => {
        if (isReadOnly) return toast.error('Cannot create orders in Read-Only mode.');
        if (cart.length === 0) return toast.error('Cart is empty!');
        if (orderSettings.orderType === 'DINE_IN' && !orderSettings.tableId) return toast.error('Please select a table for Dine-In.');
        if (orderSettings.orderType === 'TAKEAWAY' && !customerInfo.name) return toast.error('Customer Name is required for Takeaway.');

        const payload = {
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            orderType: orderSettings.orderType,
            paymentMode: orderSettings.paymentMode,
            status: 'PENDING',
            tableId: orderSettings.orderType === 'DINE_IN' ? orderSettings.tableId : null,
            items: cart.map(i => ({ encryptedId: i.encryptedId, quantity: i.quantity }))
        };

        setIsSubmitting(true);
        try {
            await employeeService.createOrder(payload);
            toast.success('Order sent to kitchen! 🍽️');
            setCart([]);
            setCustomerInfo({ name: '', phone: '' });
            setOrderSettings(prev => ({ ...prev, tableId: '' }));
            // Refresh tables to reflect new occupancy
            const tablesData = await employeeService.getAllTables();
            setTables(tablesData.filter(t => t.status === 'AVAILABLE'));
        } catch {
            toast.error('Failed to create order. Try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- HELPERS ---
    const inputCls = 'w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/60 transition';

    return (
        <div className="flex flex-col h-screen bg-[#111318] overflow-hidden text-white">

            {/* READ-ONLY BANNER */}
            {isReadOnly && (
                <div className="flex items-center gap-3 bg-red-600/90 backdrop-blur px-5 py-3 text-sm font-semibold flex-shrink-0 border-b border-red-500/40">
                    <Lock size={15} />
                    Read-Only Mode — Subscription expired. Order creation is disabled.
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">

                {/* ═══════════════ LEFT: MENU ═══════════════ */}
                <div className="flex-1 flex flex-col border-r border-gray-800 h-full bg-[#14171D]">

                    {/* Search */}
                    <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search menu items…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/60 transition"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="px-4 py-3 border-b border-gray-800 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
                        {categories.map(cat => (
                            <button
                                key={cat.encryptedCategoryId}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${selectedCategory.encryptedCategoryId === cat.encryptedCategoryId
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-gray-700'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Menu Grid */}
                    <div className="p-5 overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex justify-center mt-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
                            </div>
                        ) : menuItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                                <ShoppingBag size={40} className="opacity-30" />
                                <p className="text-sm">No items found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {menuItems.map(item => (
                                    <div
                                        key={item.encryptedId}
                                        onClick={() => !isReadOnly && item.available && addToCart(item)}
                                        className={`bg-[#1C2028] border rounded-2xl overflow-hidden transition group relative ${!item.available || isReadOnly
                                                ? 'opacity-50 cursor-not-allowed border-gray-800'
                                                : 'cursor-pointer border-gray-700 hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/5'
                                            }`}
                                    >
                                        {/* Image */}
                                        <div className="h-28 bg-gray-800 relative overflow-hidden">
                                            <img
                                                src={item.imageUrl || 'https://placehold.co/400x300/1C2028/555?text=No+Image'}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                            {!item.available && (
                                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-red-400 text-xs font-bold uppercase tracking-wider">
                                                    Out of Stock
                                                </div>
                                            )}
                                            {/* Quick add overlay */}
                                            {item.available && !isReadOnly && (
                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                    <div className="bg-yellow-500 rounded-full p-2 shadow-lg">
                                                        <Plus size={18} className="text-black" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div className="p-3">
                                            <h3 className="font-semibold text-sm text-white truncate">{item.name}</h3>
                                            <p className="text-yellow-400 font-bold text-sm mt-0.5">₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══════════════ RIGHT: CART & CHECKOUT ═══════════════ */}
                <div className="w-[380px] bg-[#1C2028] flex flex-col h-full border-l border-gray-800">

                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-2 flex-shrink-0">
                        <ChefHat size={18} className="text-yellow-400" />
                        <h2 className="text-base font-bold">Current Order</h2>
                        {cart.length > 0 && (
                            <span className="ml-auto bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </div>

                    {/* Order Config */}
                    <div className="px-5 py-4 border-b border-gray-700 space-y-3 flex-shrink-0">

                        {/* Order Type Toggle */}
                        <div className="flex gap-2 bg-black/40 border border-gray-700 p-1 rounded-xl">
                            {['DINE_IN', 'TAKEAWAY'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setOrderSettings(prev => ({ ...prev, orderType: type, tableId: '' }))}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${orderSettings.orderType === type
                                            ? 'bg-yellow-500 text-black shadow'
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {type === 'DINE_IN' ? <UtensilsCrossed size={13} /> : <ShoppingBag size={13} />}
                                    {type === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}
                                </button>
                            ))}
                        </div>

                        {/* Table Selection — only AVAILABLE tables */}
                        {orderSettings.orderType === 'DINE_IN' && (
                            <div className="relative">
                                <TableProperties className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <select
                                    value={orderSettings.tableId}
                                    onChange={e => setOrderSettings(prev => ({ ...prev, tableId: e.target.value }))}
                                    className={`${inputCls} pl-9 appearance-none`}
                                >
                                    <option value="">Select available table…</option>
                                    {tables.length === 0 ? (
                                        <option disabled>No available tables</option>
                                    ) : (
                                        tables.map(t => (
                                            <option key={t.tableId} value={t.tableId}>
                                                {t.name} — Capacity: {t.capacity}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        )}

                        {/* Customer Info */}
                        <div className="space-y-2">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <input
                                    placeholder="Customer name"
                                    value={customerInfo.name}
                                    onChange={e => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                                    className={`${inputCls} pl-9`}
                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <input
                                    placeholder="Phone (optional)"
                                    value={customerInfo.phone}
                                    onChange={e => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                    className={`${inputCls} pl-9`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-3">
                                <ShoppingBag size={40} className="opacity-20" />
                                <p className="text-sm">No items added yet</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.encryptedId} className="flex items-center gap-3 bg-black/30 border border-gray-700/50 rounded-xl p-3 group">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-white truncate">{item.name}</p>
                                        <p className="text-xs text-yellow-400 font-medium mt-0.5">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    {/* Qty controls */}
                                    <div className="flex items-center gap-1 bg-black/40 border border-gray-700 rounded-lg p-1">
                                        <button onClick={() => updateQuantity(item.encryptedId, -1)} className="p-1 hover:text-yellow-400 text-gray-400 transition rounded">
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-xs font-bold w-5 text-center text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.encryptedId, 1)} className="p-1 hover:text-yellow-400 text-gray-400 transition rounded">
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setCart(cart.filter(c => c.encryptedId !== item.encryptedId))}
                                        className="text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer: total + payment + send */}
                    <div className="px-5 py-4 border-t border-gray-700 space-y-3 flex-shrink-0">

                        {/* Subtotal */}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="font-bold text-white text-base">₹{cartTotal.toFixed(2)}</span>
                        </div>

                        {/* Payment Mode */}
                        <div className="flex gap-2">
                            {[
                                { mode: 'CASH', label: 'Cash', Icon: Banknote, active: 'border-green-500/60 bg-green-500/10 text-green-400' },
                                { mode: 'ONLINE', label: 'Online', Icon: CreditCard, active: 'border-blue-500/60 bg-blue-500/10 text-blue-400' },
                            ].map(({ mode, label, Icon, active }) => (
                                <button
                                    key={mode}
                                    onClick={() => setOrderSettings(prev => ({ ...prev, paymentMode: mode }))}
                                    className={`flex-1 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${orderSettings.paymentMode === mode
                                            ? active
                                            : 'border-gray-700 text-gray-500 hover:border-gray-600'
                                        }`}
                                >
                                    <Icon size={13} /> {label}
                                </button>
                            ))}
                        </div>

                        {/* Send to Kitchen */}
                        <button
                            onClick={submitOrder}
                            disabled={isReadOnly || isSubmitting || cart.length === 0}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${isReadOnly || cart.length === 0
                                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                    : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20 active:scale-[0.98]'
                                }`}
                        >
                            {isReadOnly ? (
                                <><Lock size={14} /> Ordering Disabled</>
                            ) : isSubmitting ? (
                                <><div className="animate-spin w-4 h-4 border-2 border-black/30 border-t-black rounded-full" /> Sending…</>
                            ) : (
                                <><ChefHat size={16} /> Send to Kitchen · ₹{cartTotal.toFixed(2)}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POSPage;
