import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEmployeeService } from '../../../services/employeeService';
import {
    ArrowLeft, User, Calendar, Clock, ShoppingBag,
    CreditCard, ChevronDown, Save, Lock, Plus, Edit
} from 'lucide-react';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import toast from 'react-hot-toast';
import OrderItemModal from '../../owner/orderManagement/OrderItemModal';
import AddOrderItemModal from '../../owner/orderManagement/AddOrderItemModal';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

const STATUS_COLORS = {
    PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    CONFIRMED: 'bg-blue-500/20   text-blue-300   border-blue-500/40',
    PREPARING: 'bg-orange-500/20 text-orange-300  border-orange-500/40',
    READY: 'bg-teal-500/20   text-teal-300    border-teal-500/40',
    COMPLETED: 'bg-green-500/20  text-green-300   border-green-500/40',
    CANCELLED: 'bg-red-500/20    text-red-300     border-red-500/40',
};

const EmployeeOrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const employeeService = useEmployeeService();
    const user = useSelector((s) => s.userSlice?.user);
    const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isSavingStatus, setIsSavingStatus] = useState(false);

    // Item management state
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [isSavingItems, setIsSavingItems] = useState(false);

    // Helper: convert current order items to API payload
    const buildItemsPayload = (items) =>
        items.map(i => ({
            encryptedId: i.encryptedMenuItemId,
            quantity: i.quantity,
            note: i.note || null,
        }));

    const fetchOrder = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await employeeService.getOrderDetail(orderId);
            setOrder(data);
            setSelectedStatus(data.status);
        } catch (err) {
            toast.error('Failed to load order. ' + (err?.response?.data?.message || ''));
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => { fetchOrder(); }, [fetchOrder]);

    // --- Status update ---
    const handleSaveStatus = async () => {
        if (isReadOnly) { toast.error('Cannot update status in Read-Only mode.'); return; }
        if (selectedStatus === order.status) return;
        setIsSavingStatus(true);
        try {
            const updated = await employeeService.updateOrderStatus(orderId, selectedStatus);
            setOrder(updated);
            setSelectedStatus(updated.status);
            toast.success(`Status updated to ${updated.status}`);
        } catch (err) {
            toast.error('Failed to update status. ' + (err?.response?.data?.message || ''));
        } finally {
            setIsSavingStatus(false);
        }
    };

    // --- Fetch menu items for add modal ---
    const fetchMenuItems = async () => {
        try {
            const data = await employeeService.searchMenu('', 'All', 0, 200);
            const items = (data.content || data).map(mi => ({
                encryptedMenuItemId: mi.encryptedId || mi.encryptedMenuItemId,
                name: mi.name,
                price: mi.price,
            }));
            setMenuItems(items);
        } catch {
            toast.error("Couldn't fetch menu items.");
        }
    };

    // --- Open edit modal ---
    const openEditModal = (item) => {
        if (isReadOnly) { toast.error('Cannot edit item in Read-Only mode.'); return; }
        setCurrentItem(item);
        setItemModalOpen(true);
    };

    // --- Save edited item ---
    const handleModalSave = async (updatedItem) => {
        if (isReadOnly) { toast.error('Cannot edit item in Read-Only mode.'); return; }

        const updatedItems = order.items.map(i =>
            i.encryptedMenuItemId === updatedItem.encryptedMenuItemId ? updatedItem : i
        );

        setIsSavingItems(true);
        try {
            const res = await employeeService.updateOrderItems(orderId, buildItemsPayload(updatedItems));
            setOrder(res);
            setItemModalOpen(false);
            toast.success('Item updated.');
        } catch (err) {
            toast.error('Failed to save item. ' + (err?.response?.data?.message || ''));
        } finally {
            setIsSavingItems(false);
        }
    };

    // --- Delete item (delete whole order if last item) ---
    const handleModalDelete = async (item) => {
        if (isReadOnly) { toast.error('Cannot delete item in Read-Only mode.'); return; }

        const remaining = order.items.filter(i => i.encryptedMenuItemId !== item.encryptedMenuItemId);

        setIsSavingItems(true);
        try {
            if (remaining.length === 0) {
                await employeeService.deleteOrder(orderId);
                toast.success('Last item removed — order deleted.');
                navigate('/employee/orders');
            } else {
                const res = await employeeService.updateOrderItems(orderId, buildItemsPayload(remaining));
                setOrder(res);
                setItemModalOpen(false);
                toast.success('Item removed.');
            }
        } catch (err) {
            toast.error('Failed to remove item. ' + (err?.response?.data?.message || ''));
        } finally {
            setIsSavingItems(false);
        }
    };

    // --- Open add modal ---
    const handleAddItemClick = async () => {
        if (isReadOnly) { toast.error('Cannot add item in Read-Only mode.'); return; }
        await fetchMenuItems();
        setAddModalOpen(true);
    };

    // --- Add new item ---
    const handleAddItem = async (newItem) => {
        if (isReadOnly) { toast.error('Cannot add item in Read-Only mode.'); return; }

        const updatedItems = [...order.items, newItem];

        setIsSavingItems(true);
        try {
            const res = await employeeService.updateOrderItems(orderId, buildItemsPayload(updatedItems));
            setOrder(res);
            setAddModalOpen(false);
            toast.success('Item added.');
        } catch (err) {
            toast.error('Failed to add item. ' + (err?.response?.data?.message || ''));
        } finally {
            setIsSavingItems(false);
        }
    };

    if (isLoading) return <CommonLoadingSpinner />;
    if (!order) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
            Order not found.
        </div>
    );

    const customerName = order.customerName || 'Walk-in';
    const statusColor = STATUS_COLORS[order.status] || 'bg-gray-700 text-gray-300 border-gray-600';
    const statusChanged = selectedStatus !== order.status;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black p-6 text-white">
            <div className="max-w-2xl mx-auto">

                {/* READ-ONLY banner */}
                {isReadOnly && (
                    <div className="flex items-center gap-2 bg-red-600/90 px-4 py-3 rounded-xl mb-5 text-sm font-semibold">
                        <Lock size={15} /> Read-Only Mode — changes are disabled
                    </div>
                )}

                {/* Back */}
                <button
                    onClick={() => navigate('/employee/orders')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm"
                >
                    <ArrowLeft size={16} /> Back to Orders
                </button>

                {/* Header card */}
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-5">
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <h1 className="text-2xl font-bold">{order.billNumber}</h1>
                            <p className="text-gray-400 text-sm mt-1">
                                {order.orderType} · {order.paymentMode}
                            </p>
                        </div>
                        <span className={`text-sm px-3 py-1 rounded-full border font-medium ${statusColor}`}>
                            {order.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                            <User size={14} className="text-gray-500" />
                            {customerName}
                        </div>
                        {order.restaurantTableName && (
                            <div className="flex items-center gap-2 text-gray-300">
                                <ShoppingBag size={14} className="text-gray-500" />
                                Table: {order.restaurantTableName}
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-300">
                            <Calendar size={14} className="text-gray-500" />
                            {order.orderDate}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Clock size={14} className="text-gray-500" />
                            {order.orderTime}
                        </div>
                    </div>
                </div>

                {/* Status update card */}
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-5">
                    <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                        <ChevronDown size={17} className="text-yellow-400" /> Update Status
                    </h2>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedStatus}
                            disabled={isReadOnly}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className={`flex-1 bg-black/50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500/50 transition-all ${isReadOnly
                                ? 'border-gray-700/30 text-gray-500 cursor-not-allowed opacity-50'
                                : 'border-gray-700 cursor-pointer'
                                }`}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleSaveStatus}
                            disabled={isReadOnly || !statusChanged || isSavingStatus}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${isReadOnly || !statusChanged
                                ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                                }`}
                        >
                            <Save size={15} />
                            {isSavingStatus ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Order items */}
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-base flex items-center gap-2">
                            <ShoppingBag size={17} className="text-yellow-400" />
                            Items ({order.items?.length ?? 0})
                        </h2>
                        <button
                            onClick={handleAddItemClick}
                            disabled={isReadOnly || isSavingItems}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <Plus size={13} /> Add Item
                        </button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {order.items?.map((item, i) => (
                            <div key={item.encryptedMenuItemId || i} className="flex justify-between items-start py-2 border-b border-gray-800 last:border-0">
                                <div className="flex-1 min-w-0 pr-3">
                                    <p className="font-medium text-sm">{item.menuItemName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × ₹{item.priceAtOrder?.toFixed(2)}</p>
                                    {item.note && (
                                        <div className="mt-1.5 flex items-start gap-1.5 bg-yellow-500/10 border border-yellow-500/25 rounded-lg px-2.5 py-1.5">
                                            <span className="text-yellow-400 text-xs mt-0.5">📝</span>
                                            <span className="text-yellow-200 text-xs leading-relaxed">{item.note}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-yellow-400 font-semibold text-sm">
                                        ₹{(item.priceAtOrder * item.quantity).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => openEditModal(item)}
                                        disabled={isReadOnly || isSavingItems}
                                        className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Edit size={13} /> Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between text-lg font-bold">
                        <div className="flex items-center gap-2">
                            <CreditCard size={18} className="text-yellow-400" />
                            <span>Total</span>
                        </div>
                        <span className="text-yellow-400">₹{order.totalAmount?.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Payment: {order.paymentMode}</p>
                </div>

            </div>

            {/* Edit item modal */}
            <OrderItemModal
                open={itemModalOpen}
                onClose={() => setItemModalOpen(false)}
                item={currentItem}
                onSave={handleModalSave}
                onDelete={handleModalDelete}
            />

            {/* Add item modal */}
            <AddOrderItemModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                menuItems={menuItems}
                onAdd={handleAddItem}
            />
        </div>
    );
};

export default EmployeeOrderDetailPage;
