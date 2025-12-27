import React, { useState, useEffect } from 'react';
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
    DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmployeeService } from '../../../services/employeeService';

const POSPage = () => {
    // --- STATE MANAGEMENT ---
    const employeeService = useEmployeeService();
    const [menuItems, setMenuItems] = useState([]);
    const [tables, setTables] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Order Settings State
    const [orderSettings, setOrderSettings] = useState({
        orderType: 'DINE_IN', // 'DINE_IN' or 'TAKEAWAY'
        paymentMode: 'CASH',  // 'CASH' or 'ONLINE'
        tableId: '',
    });

    // Customer Info State
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: ''
    });

    // --- INITIAL LOAD ---
    useEffect(() => {
        fetchInitialData();
    }, []);

    // --- SEARCH DEBOUNCE ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMenu();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedCategory]);

    // --- API CALLS ---
    const fetchInitialData = async () => {
        try {
            const tablesData = await employeeService.getAllTables();
            // console.log("Tables Data:", tablesData);
            setTables(tablesData);
            // Fetch categories (optional, if you have an API, otherwise hardcode or extract)
            const categoriesData = await employeeService.getAllCategories();
            // console.log("Categories Data:", categoriesData);
            setCategories([{encryptedCategoryId:'All', name:'All'}, ...categoriesData]); 
        } catch (error) {
            console.error("Init Error:", error);
            toast.error("Failed to load tables.");
        }
    };

    const fetchMenu = async () => {
        setLoading(true);
        try {
            // Use the new SEARCH method
            const data = await employeeService.searchMenu(searchQuery, selectedCategory.name, 0, 100); 

            // console.log("Menu Data:", data.content);
            setMenuItems(data.content || []);
        } catch (error) {
            console.error("Menu Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- CART LOGIC ---
    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.encryptedId === item.encryptedId);
            if (existing) {
                return prev.map(i => i.encryptedId === item.encryptedId ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        toast.success(`Added ${item.name}`);
    };

    const updateQuantity = (itemId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.encryptedId === itemId) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // --- SUBMIT ORDER ---
    const submitOrder = async () => {
        // Validation
        if (cart.length === 0) return toast.error("Cart is empty!");
        
        if (orderSettings.orderType === 'DINE_IN' && !orderSettings.tableId) {
            return toast.error("Please select a table for Dine-In.");
        }
        
        if (orderSettings.orderType === 'TAKEAWAY' && !customerInfo.name) {
            return toast.error("Customer Name is required for Takeaway.");
        }

      
        const payload = {
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            orderType: orderSettings.orderType,
            paymentMode: orderSettings.paymentMode,
            status: 'PENDING', // Initial Status
            tableId: orderSettings.orderType === 'DINE_IN' ? orderSettings.tableId : null,
            items: cart.map(i => ({
                encryptedId: i.encryptedId,
                quantity: i.quantity
            }))
        };

        try {
            await employeeService.createOrder(payload);
            toast.success("Order Sent to Kitchen!");
            
            // Reset Form
            setCart([]);
            setCustomerInfo({ name: '', phone: '' });
            setOrderSettings(prev => ({ ...prev, tableId: '' }));
        } catch (error) {
            console.error(error);
            toast.error("Failed to create order. Try again.");
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            
            {/* LEFT SIDE: MENU & SEARCH */}
            <div className="flex-1 flex flex-col border-r border-gray-200 h-full">
                
                {/* Search Bar */}
                <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search menu items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="px-4 py-3 bg-white shadow-sm flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat.encryptedCategoryId}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                                selectedCategory === cat 
                                ? 'bg-gray-900 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {menuItems.map(item => (
                                <div 
                                    key={item.encryptedId} 
                                    onClick={() => item.available && addToCart(item)}
                                    className={`bg-white p-3 rounded-xl border border-gray-100 shadow-sm cursor-pointer transition group relative ${!item.available ? 'opacity-60 cursor-not-allowed' : 'hover:border-yellow-500 hover:shadow-md'}`}
                                >
                                    <div className="h-28 bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                                        <img 
                                            src={item.imageUrl || "https://placehold.co/400x300?text=No+Image"} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                        />
                                        {!item.available && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm mb-1 truncate">{item.name}</h3>
                                    <p className="text-yellow-600 font-extrabold text-sm">${item.price}</p>
                                    
                                    {/* Quick Add Button Overlay */}
                                    {item.available && (
                                        <button className="absolute bottom-3 right-3 p-2 bg-gray-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-black">
                                            <Plus size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE: CART & CHECKOUT */}
            <div className="w-[400px] bg-white flex flex-col shadow-2xl z-20 h-full">
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="text-yellow-500" /> Current Order
                    </h2>
                </div>

                {/* Order Details Form */}
                <div className="p-5 border-b border-gray-100 space-y-4">
                    
                    {/* Order Type Toggle */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setOrderSettings(prev => ({ ...prev, orderType: 'DINE_IN' }))}
                            className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition ${
                                orderSettings.orderType === 'DINE_IN' ? 'bg-white shadow text-black' : 'text-gray-500'
                            }`}
                        >
                            <UtensilsCrossed size={14} /> DINE-IN
                        </button>
                        <button
                            onClick={() => setOrderSettings(prev => ({ ...prev, orderType: 'TAKEAWAY' }))}
                            className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition ${
                                orderSettings.orderType === 'TAKEAWAY' ? 'bg-white shadow text-black' : 'text-gray-500'
                            }`}
                        >
                            <ShoppingBag size={14} /> TAKEAWAY
                        </button>
                    </div>

                    {/* Table Selection (Only for DINE_IN) */}
                    {orderSettings.orderType === 'DINE_IN' && (
                        <select 
                            value={orderSettings.tableId}
                            onChange={(e) => setOrderSettings(prev => ({ ...prev, tableId: e.target.value }))}
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                        >
                            <option value="">Select Table...</option>
                            {tables.map(t => (
                                <option key={t.tableId} value={t.tableId}>
                                    Table - {t.name} - {t.status}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Customer Details */}
                    <div className="space-y-2">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input 
                                placeholder="Customer Name"
                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input 
                                placeholder="Phone Number (Optional)"
                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                            <ShoppingBag size={48} className="opacity-20" />
                            <p className="text-sm">No items added yet</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.encryptedId} className="flex justify-between items-center group">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                                    <p className="text-xs text-gray-500">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                    <button onClick={() => updateQuantity(item.encryptedId, -1)} className="p-1 hover:bg-white hover:shadow rounded transition text-gray-600"><Minus size={12} /></button>
                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.encryptedId, 1)} className="p-1 hover:bg-white hover:shadow rounded transition text-gray-600"><Plus size={12} /></button>
                                </div>
                                <button onClick={() => setCart(cart.filter(c => c.encryptedId !== item.encryptedId))} className="ml-3 text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer: Totals & Submit */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between mb-4 text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold text-gray-800">${cartTotal.toFixed(2)}</span>
                    </div>
                    
                    {/* Payment Mode Toggle */}
                    <div className="flex gap-2 mb-4">
                         <button 
                            onClick={() => setOrderSettings(prev => ({ ...prev, paymentMode: 'CASH' }))}
                            className={`flex-1 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition ${orderSettings.paymentMode === 'CASH' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}
                         >
                            <DollarSign size={14} /> CASH
                         </button>
                         <button 
                            onClick={() => setOrderSettings(prev => ({ ...prev, paymentMode: 'ONLINE' }))}
                            className={`flex-1 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition ${orderSettings.paymentMode === 'ONLINE' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}
                         >
                            <CreditCard size={14} /> ONLINE
                         </button>
                    </div>

                    <button 
                        onClick={submitOrder}
                        className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transform active:scale-95 transition flex justify-center items-center gap-2"
                    >
                        <span>Send to Kitchen</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs ml-2">${cartTotal.toFixed(2)}</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default POSPage;

