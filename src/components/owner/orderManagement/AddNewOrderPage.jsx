import React, { useState, useEffect, useMemo } from 'react';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../hooks/useDebounce';
import toast from 'react-hot-toast';
import {
  ArrowLeft, User, UserCheck, Loader2, XCircle,
  ShoppingCart, Search, Plus, Minus, Trash2,
  UtensilsCrossed, ShoppingBag, Banknote, CreditCard,
  TableProperties, ChefHat, StickyNote
} from 'lucide-react';

// ─── shared atomic styles ───────────────────────────────────────────────────
const CARD = 'bg-[#1C2028] border border-gray-700/60 rounded-2xl p-6';
const LABEL = 'block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide';
const INPUT = 'w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/60 transition';
const SELECT = 'w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/60 transition appearance-none cursor-pointer';

const AddNewOrderPage = () => {
  const { axiosOwnerInstance } = useAxios();
  const navigate = useNavigate();

  // ── Customer ─────────────────────────────────────────────────────────────
  const [customer, setCustomer] = useState({ phone: '', name: '', email: '', encryptedId: '' });
  const [isCustomerFound, setIsCustomerFound] = useState(false);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [resettingCustomer, setResettingCustomer] = useState(false);

  // ── Order config ─────────────────────────────────────────────────────────
  const [orderType, setOrderType] = useState('DINE_IN');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [status, setStatus] = useState('CONFIRMED');
  const [restaurantTableId, setRestaurantTableId] = useState('');
  const [tables, setTables] = useState([]);

  // ── Menu / cart ──────────────────────────────────────────────────────────
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [itemSearchResults, setItemSearchResults] = useState([]);
  const [isItemSearching, setIsItemSearching] = useState(false);
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Debounce ─────────────────────────────────────────────────────────────
  const debouncedPhone = useDebounce(customer.phone, 1500);
  const debouncedEmail = useDebounce(customer.email, 1500);
  const debouncedItemSearch = useDebounce(itemSearchQuery, 1300);

  // ── Customer auto-lookup by phone ─────────────────────────────────────────
  useEffect(() => {
    if (resettingCustomer) { setResettingCustomer(false); return; }
    if (isCustomerFound || !debouncedPhone) return;
    (async () => {
      setIsSearchingCustomer(true);
      try {
        const r = await axiosOwnerInstance.get(`/customer/check?phone=${debouncedPhone}`);
        if (r.status === 200 && r.data) {
          toast.success('Existing customer found!');
          const { name, phone, email, encryptedId } = r.data;
          setCustomer({ name, phone, email, encryptedId });
          setIsCustomerFound(true);
        }
      } catch { /* 204 / not found — ignore */ }
      finally { setIsSearchingCustomer(false); }
    })();
  }, [debouncedPhone, isCustomerFound, axiosOwnerInstance]);

  // ── Customer auto-lookup by email (when no phone) ─────────────────────────
  useEffect(() => {
    if (resettingCustomer) { setResettingCustomer(false); return; }
    if (isCustomerFound || !debouncedEmail || debouncedPhone) return;
    (async () => {
      setIsSearchingCustomer(true);
      try {
        const r = await axiosOwnerInstance.get(`/customer/check?email=${debouncedEmail}`);
        if (r.status === 200 && r.data) {
          toast.success('Existing customer found!');
          const { name, phone, email, encryptedId } = r.data;
          setCustomer({ name, phone, email, encryptedId });
          setIsCustomerFound(true);
        }
      } catch { /* ignore */ }
      finally { setIsSearchingCustomer(false); }
    })();
  }, [debouncedEmail, debouncedPhone, isCustomerFound, axiosOwnerInstance]);

  // ── Fetch AVAILABLE tables when DINE_IN ───────────────────────────────────
  useEffect(() => {
    if (orderType !== 'DINE_IN') { setTables([]); setRestaurantTableId(''); return; }
    (async () => {
      try {
        const r = await axiosOwnerInstance.get('/tables/list');
        // Only show tables that are currently available
        setTables((r.data || []).filter(t => t.status === 'AVAILABLE'));
      } catch { toast.error('Failed to fetch tables.'); }
    })();
  }, [orderType, axiosOwnerInstance]);

  // ── Menu item search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedItemSearch) { setItemSearchResults([]); return; }
    (async () => {
      setIsItemSearching(true);
      try {
        const r = await axiosOwnerInstance.get(`/menu-items/search?name=${debouncedItemSearch}`);
        setItemSearchResults(r.data || []);
      } catch { toast.error('Failed to search items.'); }
      finally { setIsItemSearching(false); }
    })();
  }, [debouncedItemSearch, axiosOwnerInstance]);

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const handleAddItemToCart = (item) => {
    const existing = cart.find(c => c.encryptedId === item.encryptedId);
    if (existing) handleUpdateQuantity(item.encryptedId, existing.quantity + 1);
    else setCart(prev => [...prev, { ...item, quantity: 1 }]);
    setItemSearchQuery('');
    setItemSearchResults([]);
  };
  const handleUpdateQuantity = (id, qty) => {
    if (qty <= 0) handleRemoveFromCart(id);
    else setCart(prev => prev.map(i => i.encryptedId === id ? { ...i, quantity: qty } : i));
  };
  const handleRemoveFromCart = (id) => setCart(prev => prev.filter(i => i.encryptedId !== id));

  const { subtotal } = useMemo(() => {
    const sub = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
    return { subtotal: sub };
  }, [cart]);

  const resetCustomer = () => {
    setResettingCustomer(true);
    setCustomer({ phone: '', name: '', email: '', encryptedId: '' });
    setIsCustomerFound(false);
    setIsSearchingCustomer(false);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isCustomerFound && (!customer.name || !customer.phone)) {
      toast.error('Customer Name and Phone are required for new customers.');
      return;
    }
    if (orderType === 'DINE_IN' && !restaurantTableId) {
      toast.error('A table must be selected for Dine-In orders.');
      return;
    }
    if (cart.length === 0) { toast.error('Add at least one item to the order.'); return; }

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
      items: cart.map(i => ({ encryptedId: i.encryptedId, quantity: i.quantity })),
    };
    try {
      await axiosOwnerInstance.post('/orders/create', payload);
      toast.success('Order created successfully!');
      navigate('/owner/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#111318] text-white">

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-20 bg-[#111318]/90 backdrop-blur border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/owner/orders')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center justify-center">
            <ChefHat size={16} className="text-yellow-400" />
          </div>
          <h1 className="text-lg font-bold">Create New Order</h1>
        </div>
        {/* Floating totals chip */}
        {cart.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5">
            <ShoppingCart size={14} className="text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">₹{subtotal.toFixed(2)}</span>
            <span className="text-gray-500 text-xs">· {cart.length} item{cart.length > 1 ? 's' : ''}</span>
          </div>
        )}
        <button
          type="submit"
          form="order-form"
          disabled={isSubmitting || isSearchingCustomer || cart.length === 0}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-yellow-500/20"
        >
          {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <ChefHat size={15} />}
          {isSubmitting ? 'Creating…' : 'Create Order'}
        </button>
      </div>

      {/* ── BODY ── */}
      <form id="order-form" onSubmit={handleSubmit} className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ═══ LEFT COLUMN ═══ */}
        <div className="space-y-5">

          {/* Customer Card */}
          <div className={CARD}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCustomerFound ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                  {isCustomerFound
                    ? <UserCheck size={15} className="text-green-400" />
                    : <User size={15} className="text-yellow-400" />}
                </div>
                <h2 className="font-semibold text-base">
                  {isCustomerFound
                    ? <span className="text-green-400">Customer Found ✓</span>
                    : 'Customer Details'}
                </h2>
              </div>
              {isCustomerFound && (
                <button
                  type="button"
                  onClick={resetCustomer}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition"
                >
                  <XCircle size={12} /> Clear
                </button>
              )}
            </div>

            {!isCustomerFound && (
              <p className="text-xs text-gray-500 mb-4 bg-black/20 border border-gray-700/50 rounded-lg px-3 py-2">
                Type a phone or email to auto-find existing customers. Name + Phone are required for new ones.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="relative">
                <label className={LABEL}>Phone *</label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={customer.phone}
                  onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
                  readOnly={isCustomerFound}
                  className={`${INPUT} ${isCustomerFound ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="9876543210"
                  autoFocus
                />
                {isSearchingCustomer && <Loader2 className="absolute right-3 bottom-2.5 h-4 w-4 animate-spin text-yellow-400" />}
              </div>
              {/* Name */}
              <div>
                <label className={LABEL}>Name *</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
                  readOnly={isCustomerFound}
                  className={`${INPUT} ${isCustomerFound ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {/* Email */}
              <div className="sm:col-span-2 relative">
                <label className={LABEL}>Email</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))}
                  readOnly={isCustomerFound}
                  className={`${INPUT} ${isCustomerFound ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="john@example.com"
                />
                {isSearchingCustomer && <Loader2 className="absolute right-3 bottom-2.5 h-4 w-4 animate-spin text-yellow-400" />}
              </div>
            </div>
          </div>

          {/* Order Config Card */}
          <div className={CARD}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center justify-center">
                <StickyNote size={15} className="text-yellow-400" />
              </div>
              <h2 className="font-semibold text-base">Order Details</h2>
            </div>

            <div className="space-y-4">

              {/* Order Type toggle */}
              <div>
                <label className={LABEL}>Order Type</label>
                <div className="flex gap-2 bg-black/40 border border-gray-700 p-1 rounded-xl">
                  {[
                    { val: 'DINE_IN', label: 'Dine-In', Icon: UtensilsCrossed },
                    { val: 'TAKE_AWAY', label: 'Take-Away', Icon: ShoppingBag },
                  ].map(({ val, label, Icon }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setOrderType(val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${orderType === val
                          ? 'bg-yellow-500 text-black shadow'
                          : 'text-gray-500 hover:text-gray-200'
                        }`}
                    >
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table (DINE_IN only) */}
              {orderType === 'DINE_IN' && (
                <div>
                  <label className={LABEL}>
                    <TableProperties size={12} className="inline mr-1 mb-0.5" />
                    Table * (available only)
                  </label>
                  <select
                    value={restaurantTableId}
                    onChange={e => setRestaurantTableId(e.target.value)}
                    className={SELECT}
                  >
                    <option value="" disabled>Select a table…</option>
                    {tables.length === 0
                      ? <option disabled>No available tables right now</option>
                      : tables.map(t => (
                        <option key={t.tableId} value={t.tableId}>
                          {t.name} — Capacity: {t.capacity}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Payment Mode */}
                <div>
                  <label className={LABEL}>Payment Mode</label>
                  <div className="flex gap-2">
                    {[
                      { val: 'CASH', Icon: Banknote, color: 'border-green-500/60 bg-green-500/10 text-green-400' },
                      { val: 'ONLINE', Icon: CreditCard, color: 'border-blue-500/60 bg-blue-500/10 text-blue-400' },
                    ].map(({ val, Icon, color }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPaymentMode(val)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${paymentMode === val ? color : 'border-gray-700 text-gray-500 hover:border-gray-600'
                          }`}
                      >
                        <Icon size={13} /> {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Initial Status */}
                <div>
                  <label className={LABEL}>Initial Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className={SELECT}
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="space-y-5">

          {/* Menu Search Card */}
          <div className={CARD}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center justify-center">
                <Search size={15} className="text-yellow-400" />
              </div>
              <h2 className="font-semibold text-base">Add Items</h2>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                type="text"
                value={itemSearchQuery}
                onChange={e => setItemSearchQuery(e.target.value)}
                placeholder="Type to search menu items…"
                className={`${INPUT} pl-9`}
              />
              {isItemSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-yellow-400" />
              )}

              {/* Search dropdown */}
              {itemSearchResults.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-2 bg-[#22272F] border border-gray-700 rounded-2xl max-h-64 overflow-y-auto z-30 shadow-2xl">
                  {itemSearchResults.map(item => {
                    const unavailable = item.status === 'UNAVAILABLE' || item.isAvailable === false;
                    return (
                      <li
                        key={item.encryptedId}
                        onClick={!unavailable ? () => handleAddItemToCart(item) : undefined}
                        className={`flex justify-between items-center py-3 px-4 border-b border-gray-700/50 last:border-0 transition rounded-xl ${unavailable
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-yellow-500/10 cursor-pointer'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${unavailable ? 'line-through text-gray-500' : 'text-white'}`}>
                            {item.name}
                          </span>
                          {unavailable && (
                            <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                              unavailable
                            </span>
                          )}
                        </div>
                        <span className={`text-sm font-mono font-semibold ${unavailable ? 'text-gray-600' : 'text-yellow-400'}`}>
                          ₹{item.price?.toFixed(2)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Cart Card */}
          <div className={CARD}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center justify-center">
                  <ShoppingCart size={15} className="text-yellow-400" />
                </div>
                <h2 className="font-semibold text-base">Cart</h2>
              </div>
              {cart.length > 0 && (
                <span className="text-xs text-gray-500">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-600 gap-3">
                <ShoppingCart size={36} className="opacity-20" />
                <p className="text-sm">No items added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div
                    key={item.encryptedId}
                    className="flex items-center gap-3 bg-black/30 border border-gray-700/50 rounded-xl p-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{item.name}</p>
                      <p className="text-xs text-yellow-400 font-medium mt-0.5">₹{item.price.toFixed(2)}</p>
                    </div>
                    {/* Qty controls */}
                    <div className="flex items-center gap-1 bg-black/40 border border-gray-700 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.encryptedId, item.quantity - 1)}
                        className="p-1 hover:text-yellow-400 text-gray-400 transition rounded"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold w-5 text-center text-white">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.encryptedId, item.quantity + 1)}
                        className="p-1 hover:text-yellow-400 text-gray-400 transition rounded"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="text-sm font-mono font-semibold text-yellow-400 w-20 text-right">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.encryptedId)}
                      className="text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {/* Total row */}
                <div className="border-t border-gray-700/60 pt-4 mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className="text-xl font-bold text-yellow-400">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNewOrderPage;
