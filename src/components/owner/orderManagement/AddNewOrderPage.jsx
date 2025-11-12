import React, { useState, useEffect, useMemo } from 'react';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../hooks/useDebounce';
import toast from 'react-hot-toast';
import {
  X, User, UserCheck, Loader2, XCircle, ShoppingCart, Search, Plus, Minus, Trash2, ArrowLeft
} from 'lucide-react';
import { Button } from '../../ui/button';

const inputStyles =
  "rounded-xl bg-gray-950 border-2 border-yellow-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 text-yellow-100 placeholder:text-yellow-300 px-4 py-2 w-full outline-none transition shadow-sm";

const dropdownStyles =
  "rounded-xl bg-yellow-800/90 border-2 border-yellow-700 text-gray-900 font-semibold focus:ring-2 focus:ring-yellow-400 px-4 py-2 w-full appearance-none transition shadow-lg";

const AddNewOrderPage = () => {
  const { axiosOwnerInstance } = useAxios();
  const navigate = useNavigate();

  // Customer State
  const [customer, setCustomer] = useState({
    phone: '',
    name: '',
    email: '',
    encryptedId: ''
  });
  const [isCustomerFound, setIsCustomerFound] = useState(false);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);


  // Order Details State
  const [orderType, setOrderType] = useState('DINE_IN');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [status, setStatus] = useState('CONFIRMED');
  const [restaurantTableId, setRestaurantTableId] = useState('');
  const [tables, setTables] = useState([]);

  // Item & Cart State
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [itemSearchResults, setItemSearchResults] = useState([]);
  const [isItemSearching, setIsItemSearching] = useState(false);
  const [cart, setCart] = useState([]);
  const [resettingCustomer, setResettingCustomer] = useState(false);


  // Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debouncing
  const debouncedCustomerPhone = useDebounce(customer.phone, 1500);
  const debouncedCustomerEmail = useDebounce(customer.email, 1500);
  const debouncedItemSearch = useDebounce(itemSearchQuery, 1300);

  // Effects for Customer Search
  useEffect(() => {

    if (resettingCustomer) {
      setResettingCustomer(false);
      console.log("Resetting customer search");
      return;
    }

    if (isCustomerFound || !debouncedCustomerPhone) {
      console.log("Skipping customer search");
      return;
    }
    const checkCustomer = async () => {
      setIsSearchingCustomer(true);
      try {
        console.log("Checking customer with phone:", debouncedCustomerPhone);
        const response = await axiosOwnerInstance.get(`/customer/check?phone=${debouncedCustomerPhone}`);
        if (response.status === 200 && response.data) {
          toast.success("Existing customer found!");
          const { name, phone, email, encryptedId } = response.data;
          setCustomer({ name, phone, email, encryptedId });
          setIsCustomerFound(true);
        }
      } catch (error) {/* no content is ok */ }
      finally { setIsSearchingCustomer(false); }
    };
    checkCustomer();
  }, [debouncedCustomerPhone, isCustomerFound, axiosOwnerInstance]);

  useEffect(() => {
    if (resettingCustomer) {
      setResettingCustomer(false);
      console.log("Resetting customer search");
      return;
    }
    if (isCustomerFound || !debouncedCustomerEmail || debouncedCustomerPhone) return;
    const checkCustomer = async () => {
      setIsSearchingCustomer(true);
      try {
        const response = await axiosOwnerInstance.get(`/customer/check?email=${debouncedCustomerEmail}`);
        if (response.status === 200 && response.data) {
          toast.success("Existing customer found!");
          const { name, phone, email, encryptedId } = response.data;
          setCustomer({ name, phone, email, encryptedId });
          setIsCustomerFound(true);
        }
      } catch (error) {/* no content is ok */ }
      finally { setIsSearchingCustomer(false); }
    };
    checkCustomer();
  }, [debouncedCustomerEmail, debouncedCustomerPhone, isCustomerFound, axiosOwnerInstance]);

  // Effect for Fetching Tables
  useEffect(() => {
    if (orderType === 'DINE_IN') {
      const fetchTables = async () => {
        try {
          const response = await axiosOwnerInstance.get('/tables/list');
          setTables(response.data);
        } catch (error) { toast.error("Failed to fetch tables."); }
      };
      fetchTables();
    } else { setTables([]); setRestaurantTableId(''); }
  }, [orderType, axiosOwnerInstance]);

  // Effect for Searching Menu Items
  useEffect(() => {
    if (!debouncedItemSearch) {
      setItemSearchResults([]);
      return;
    }
    const searchItems = async () => {
      setIsItemSearching(true);
      try {
        const response = await axiosOwnerInstance.get(`/menu-items/search?name=${debouncedItemSearch}`);
        setItemSearchResults(response.data || []);
      } catch (error) {
        toast.error("Failed to search items.");
      } finally { setIsItemSearching(false); }
    };
    searchItems();
  }, [debouncedItemSearch, axiosOwnerInstance]);

  // Cart Management
  const handleAddItemToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.encryptedMenuItemId === item.encryptedMenuItemId);
    if (existingItem) {
      handleUpdateQuantity(item.encryptedMenuItemId, existingItem.quantity + 1);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    setItemSearchQuery('');
    setItemSearchResults([]);
  };

  const handleUpdateQuantity = (encryptedMenuItemId, quantity) => {
    if (quantity <= 0) handleRemoveFromCart(encryptedMenuItemId);
    else setCart(cart.map(item =>
      item.encryptedMenuItemId === encryptedMenuItemId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveFromCart = (encryptedMenuItemId) => {
    setCart(cart.filter(item => item.encryptedMenuItemId !== encryptedMenuItemId));
  };

  // Calculate Totals
  const { subtotal, totalAmount } = useMemo(() => {
    const sub = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return { subtotal: sub, totalAmount: sub };
  }, [cart]);

  // Customer Reset
  const resetCustomer = () => {
    setResettingCustomer(true);
    setCustomer({ phone: '', name: '', email: '', encryptedId: '' });
    setIsCustomerFound(false);
    setIsSearchingCustomer(false);
  };


  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isCustomerFound && (!customer.name || !customer.phone)) {
      toast.error("Customer Name and Phone are required for new customers.");
      return;
    }
    if (orderType === 'DINE_IN' && !restaurantTableId) {
      toast.error("A table must be selected for DINE_IN orders.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Order must contain at least one item.");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      customerEncryptedId: isCustomerFound ? customer.encryptedId : undefined,
      customerName: isCustomerFound ? undefined : customer.name,
      customerPhone: isCustomerFound ? undefined : customer.phone,
      customerEmail: isCustomerFound ? undefined : customer.email,
      orderType,
      paymentMode,
      status,
      tableId: orderType === 'DINE_IN' ? restaurantTableId : undefined,
      items: cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity
      })),
    };
    try {
      await axiosOwnerInstance.post('/orders/create', payload);
      toast.success("Order created successfully!");
      navigate('/owner/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create order.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800 min-h-screen flex justify-center items-center">
      <div className="max-w-5xl w-full mx-auto p-4 md:p-8">
        <header className="sticky top-0 z-10 bg-gray-950/80 rounded-lg shadow-lg flex items-center justify-between py-3 mb-8">
          <Button onClick={() => navigate('/owner/orders')} variant="ghost" className="p-2 text-gray-100 hover:bg-gray-800 hover:text-yellow-500">
            <ArrowLeft size={20} />
            <span className="ml-2 font-semibold">Back</span>
          </Button>
          <h1 className="text-3xl font-bold text-center text-yellow-400 drop-shadow">New Order</h1>
          <div style={{ width: 56 }}></div>
        </header>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column */}
          <section className="space-y-6">
            {/* Customer Card */}
            <div className="bg-gray-900/70 rounded-2xl shadow-xl border-2 border-yellow-700 p-6 transition-all hover:scale-[1.01] flex flex-col gap-4 relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  {isCustomerFound ? <UserCheck className="text-green-400" /> : <User />}
                  <span className={isCustomerFound ? "text-green-400" : "text-yellow-200"}>Customer</span>
                </div>
                {isCustomerFound && (
                  <Button type="button" variant="outline" size="sm" onClick={resetCustomer}>
                    <XCircle className="mr-1" /> Clear
                  </Button>
                )}
              </div>
              {!isCustomerFound && (
                <p className="text-xs text-yellow-400 mb-3">
                  Start by typing Phone or Email. Name + Phone required for new customer.
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <div className="relative">
                  <label htmlFor="customerPhone" className="text-sm font-medium text-yellow-300">Phone*</label>
                  <input
                    id="customerPhone"
                    type="tel"
                    value={customer.phone}
                    onChange={e => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    readOnly={isCustomerFound}
                    className={inputStyles}
                    placeholder="e.g., 9876543210"
                    autoFocus
                  />
                  {isSearchingCustomer && <Loader2 className="absolute right-3 top-9 h-5 w-5 animate-spin text-yellow-400" />}
                </div>
                <div>
                  <label className="text-sm font-medium text-yellow-300">Name*</label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))}
                    readOnly={isCustomerFound}
                    className={inputStyles}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div className="md:col-span-2 relative">
                  <label className="text-sm font-medium text-yellow-300">Email</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={e => setCustomer(c => ({ ...c, email: e.target.value }))}
                    readOnly={isCustomerFound}
                    className={inputStyles}
                    placeholder="e.g., john@example.com"
                  />
                  {isSearchingCustomer && <Loader2 className="absolute right-3 top-9 h-5 w-5 animate-spin text-yellow-400" />}
                </div>
              </div>
            </div>
            {/* Order Details Card */}
            <div className="bg-gray-900/70 rounded-2xl shadow-xl border-2 border-yellow-700 p-6 space-y-5 transition-all hover:scale-[1.01]">
              <h3 className="text-xl font-semibold text-yellow-300">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-yellow-300">Order Type*</label>
                  <select
                    value={orderType}
                    onChange={e => setOrderType(e.target.value)}
                    className={dropdownStyles}
                  >
                    <option value="DINE_IN">Dine-In</option>
                    <option value="TAKE_AWAY">Take-Away</option>
                  </select>
                </div>
                {orderType === 'DINE_IN' && (
                  <div>
                    <label className="text-sm font-medium text-yellow-300">Select Table*</label>
                    <select
                      value={restaurantTableId}
                      onChange={e => setRestaurantTableId(e.target.value)}
                      className={dropdownStyles}
                    >
                      <option value="" disabled>Select a table</option>
                      {tables.map(table => (
                        <option key={table.tableId} value={table.tableId}>{table.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-yellow-300">Payment Mode*</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value)}
                    className={dropdownStyles}
                  >
                    <option value="CASH">Cash</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-yellow-300">Initial Status*</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className={dropdownStyles}
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
          {/* Right Column */}
          <section className="space-y-6">
            {/* Menu Item Search */}
            <div className="bg-gray-900/70 rounded-2xl shadow-xl border-2 border-yellow-700 p-6 space-y-4 relative">
              <h3 className="text-xl font-semibold text-yellow-300">Menu Items</h3>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={itemSearchQuery}
                  onChange={e => setItemSearchQuery(e.target.value)}
                  placeholder="Type to search menu items..."
                  className={inputStyles}
                />

                {isItemSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-yellow-400" />}
                {itemSearchResults.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full bg-yellow-900 border-2 border-yellow-700 rounded-2xl max-h-64 overflow-y-auto z-20 shadow-2xl mt-2 transition-all duration-200 animate-fade-in">
                    {itemSearchResults.map(item => {
                      // Accepts both a "status" field and `isAvailable` for safety
                      const isUnavailable = item.status === "UNAVAILABLE" || item.isAvailable === false;

                      return (
                        <li
                          key={item.encryptedId}
                          // Only allow click if available
                          onClick={!isUnavailable ? () => handleAddItemToCart(item) : undefined}
                          className={
                            "flex justify-between items-center py-3 px-4 border-b border-yellow-700 last:border-b-0 transition rounded-xl " +
                            (isUnavailable
                              ? "bg-gray-700 cursor-not-allowed opacity-60"
                              : "hover:bg-yellow-400/30 cursor-pointer")
                          }
                          style={isUnavailable ? { pointerEvents: "none" } : {}}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                "font-semibold " +
                                (isUnavailable ? "text-gray-400 line-through" : "text-yellow-100")
                              }
                            >
                              {item.name}
                            </span>
                            {isUnavailable && (
                              <span className="ml-2 bg-gray-600 text-xs text-gray-200 px-2 py-1 rounded">
                                unavailable
                              </span>
                            )}
                          </div>
                          <span
                            className={
                              "font-mono " +
                              (isUnavailable ? "text-gray-400" : "text-yellow-200")
                            }
                          >
                            ₹{item.price?.toFixed(2)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                )}
              </div>
            </div>
            {/* Cart Section */}
            <div className="bg-gray-900/70 rounded-2xl shadow-xl border-2 border-yellow-700 p-6 space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-yellow-300">
                <ShoppingCart /> Cart
              </h3>
              {cart.length === 0 ? (
                <p className="text-yellow-400 text-center py-4">No items yet. Start by searching above.</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.encryptedMenuItemId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-yellow-900/40 border-2 border-yellow-900">
                      <div>
                        <p className="font-semibold text-yellow-100">{item.name}</p>
                        <p className="text-xs text-yellow-400 font-mono">₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 border border-yellow-700 rounded-full bg-yellow-900 px-2">
                        <Button type="button" size="sm" variant="ghost" className="hover:bg-yellow-700 rounded-full"
                          onClick={() => handleUpdateQuantity(item.encryptedMenuItemId, item.quantity - 1)}>
                          <Minus size={16} />
                        </Button>
                        <span className="w-8 text-center font-bold text-yellow-300">{item.quantity}</span>
                        <Button type="button" size="sm" variant="ghost" className="hover:bg-yellow-700 rounded-full"
                          onClick={() => handleUpdateQuantity(item.encryptedMenuItemId, item.quantity + 1)}>
                          <Plus size={16} />
                        </Button>
                      </div>
                      <p className="w-20 text-right font-mono text-yellow-300">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <Button type="button" size="sm" variant="ghost"
                        className="text-red-400 hover:text-red-500"
                        onClick={() => handleRemoveFromCart(item.encryptedMenuItemId)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                  {/* Totals */}
                  <div className="border-t border-yellow-700 pt-4 mt-2 space-y-2">
                    <div className="flex justify-between text-lg">
                      <span className="text-yellow-200">Subtotal</span>
                      <span className="font-mono text-yellow-400">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold">
                      <span className="text-yellow-400">Total</span>
                      <span className="font-mono text-yellow-200">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Floating Submit Button */}
            <Button
              type="submit"
              className="fixed bottom-8 right-8 btn-primary py-3 px-6 rounded-full shadow-lg text-lg bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold transition disabled:bg-yellow-800 disabled:text-gray-400"
              disabled={isSubmitting || isSearchingCustomer || cart.length === 0}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Create Order"}
            </Button>
          </section>
        </form>
      </div>
    </div>
  );
};

export default AddNewOrderPage;

