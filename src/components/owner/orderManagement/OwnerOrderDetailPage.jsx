import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAxios } from '../../../axios/instances/axiosInstances';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, Printer, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import OrderItemModal from './OrderItemModal';
import AddOrderItemModal from './AddOrderItemModal';
import { useSelector } from 'react-redux';

// ---- Main Component ----
const STATUS_MAP = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
};
const PAGE_BG = "bg-[#2C2F36] min-h-screen";
const PANEL = "bg-[#22242A] border border-gray-700 rounded-xl p-6 shadow-xl";

const printCSS = `
@media print {
  body * { visibility: hidden; }
  #bill-print, #bill-print * { visibility: visible; }
  #bill-print { position: absolute; left: 0; top: 0; width: 100vw; background: white; color: #222; padding: 1.5rem; }
  #bill-print .no-print { display: none !important;}
  #bill-print .bill-head {font-size: 1.25rem; font-weight: bold;}
  #bill-print .bill-total {font-size: 1.1rem; font-weight: bold;}
}
`;

const statusOptions = [
  "PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"
];

const OwnerOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { axiosOwnerInstance } = useAxios();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Item Modals
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [isSavingItems, setIsSavingItems] = useState(false);

  const user = useSelector((state) => state.userSlice?.user);
  const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';

  // Helper: build the items payload for the PUT /items endpoint
  const buildItemsPayload = (items) =>
    items.map(i => ({
      encryptedId: i.encryptedMenuItemId,
      quantity: i.quantity,
      note: i.note || null,
    }));

  const fetchMenuItems = async () => {
    try {
      const res = await axiosOwnerInstance.get('/menu-items/search', { params: { name: '' } });
      // Remap the owner menu-item search response to what AddOrderItemModal expects
      const mapped = res.data.map(mi => ({
        encryptedMenuItemId: mi.encryptedId,
        name: mi.name,
        price: mi.price,
      }));
      setMenuItems(mapped);
    } catch {
      toast.error("Couldn't fetch menu items for adding.");
    }
  };

  // --- Fetch order ---
  useEffect(() => {
    const fetchDetails = async () => {
      if (!orderId) return;
      try {
        setIsLoading(true);
        const response = await axiosOwnerInstance.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch {
        toast.error("Failed to fetch order details.");
        setError("Could not load order details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [orderId, axiosOwnerInstance]);

  // --- Status update ---
  const handleStatusChange = async (newStatus) => {
    if (isReadOnly) {
      toast.error("Cannot change order status in Read-Only mode.");
      return;
    }
    if (!orderId || !order) return;
    const oldStatus = order.status;
    setOrder({ ...order, status: newStatus });
    try {
      await axiosOwnerInstance.put(`/orders/status/${orderId}?status=${newStatus}`);
      toast.success("Order status updated!");
    } catch {
      setOrder({ ...order, status: oldStatus });
      toast.error("Failed to update status.");
    }
  };

  // --- Delete whole order ---
  const handleDeleteOrder = async () => {
    if (isReadOnly) {
      toast.error("Cannot delete order in Read-Only mode.");
      return;
    }
    if (!orderId) return;
    if (globalThis.confirm("Are you sure you want to delete this order permanently?")) {
      try {
        await axiosOwnerInstance.delete(`/orders/${orderId}`);
        toast.success("Order deleted successfully.");
        navigate('/owner/orders');
      } catch {
        toast.error("Failed to delete order.");
      }
    }
  };

  const handleBillPrint = () => {
    const style = document.createElement('style');
    style.innerHTML = printCSS;
    document.head.appendChild(style);
    document.getElementById("bill-print").style.display = "block";
    globalThis.print();
    document.getElementById("bill-print").style.display = "none";
    document.head.removeChild(style);
  };

  // ----- Edit, Add, Delete workflow for order items -----
  const openEditModal = (item) => {
    if (isReadOnly) {
      toast.error("Cannot edit item in Read-Only mode.");
      return;
    }
    setCurrentItem(item);
    setItemModalOpen(true);
  };

  // Save (edit) an existing item — persist to backend
  const handleModalSave = async (updatedItem) => {
    if (isReadOnly) { toast.error("Cannot edit item in Read-Only mode."); return; }

    const updatedItems = order.items.map(i =>
      i.encryptedMenuItemId === updatedItem.encryptedMenuItemId ? updatedItem : i
    );

    setIsSavingItems(true);
    try {
      const res = await axiosOwnerInstance.put(
        `/orders/${orderId}/items`,
        buildItemsPayload(updatedItems)
      );
      setOrder(res.data);
      setItemModalOpen(false);
      toast.success("Item updated.");
    } catch {
      toast.error("Failed to save item changes.");
    } finally {
      setIsSavingItems(false);
    }
  };

  // Delete an item —  if it is the last item, delete the whole order
  const handleModalDelete = async (item) => {
    if (isReadOnly) { toast.error("Cannot delete item in Read-Only mode."); return; }

    const remaining = order.items.filter(i => i.encryptedMenuItemId !== item.encryptedMenuItemId);

    setIsSavingItems(true);
    try {
      if (remaining.length === 0) {
        // Last item — delete the entire order
        await axiosOwnerInstance.delete(`/orders/${orderId}`);
        toast.success("Last item removed — order deleted.");
        navigate('/owner/orders');
      } else {
        const res = await axiosOwnerInstance.put(`/orders/${orderId}/items`, buildItemsPayload(remaining));
        setOrder(res.data);
        setItemModalOpen(false);
        toast.success("Item removed.");
      }
    } catch {
      toast.error("Failed to remove item.");
    } finally {
      setIsSavingItems(false);
    }
  };

  const handleAddItemClick = async () => {
    if (isReadOnly) { toast.error("Cannot add item in Read-Only mode."); return; }
    await fetchMenuItems();
    setAddModalOpen(true);
  };

  // Add a new item — persist to backend
  const handleAddItem = async (newItem) => {
    if (isReadOnly) { toast.error("Cannot add item in Read-Only mode."); return; }

    const updatedItems = [...order.items, newItem];

    setIsSavingItems(true);
    try {
      const res = await axiosOwnerInstance.put(`/orders/${orderId}/items`, buildItemsPayload(updatedItems));
      setOrder(res.data);
      setAddModalOpen(false);
      toast.success("Item added to bill.");
    } catch {
      toast.error("Failed to add item.");
    } finally {
      setIsSavingItems(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-white">Loading order details...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
  if (!order) return <div className="p-8 text-center text-white">Order not found.</div>;

  return (
    <div className={PAGE_BG + " p-6 md:p-10"}>
      {/* --- Header --- */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 no-print">
        <div>
          <Button onClick={() => navigate('/owner/orders')} className="bg-gray-700 hover:bg-gray-900 p-2 mb-2 rounded font-medium">
            <ArrowLeft size={18} /> <span className="ml-2">Back</span>
          </Button>
          <div className="flex items-center mt-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Bill <span className="text-yellow-400">#{order.billNumber}</span>
            </h1>
            <span className="ml-2 px-2 py-1 rounded bg-gray-800 text-yellow-400 text-xs uppercase font-semibold">
              {order.orderType}
            </span>
          </div>
          <span className="text-gray-400 block mt-1">
            Created: {order.orderDate} {order.orderTime}
          </span>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleBillPrint} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 rounded-lg">
            <Printer className="mr-1" size={17} />
            Print
          </Button>
          <Button
            onClick={handleDeleteOrder}
            disabled={isReadOnly || isSavingItems}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="mr-1" size={17} />
            Delete
          </Button>
        </div>
      </header>
      {/* --- Main Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* ORDER ITEMS SECTION */}
        <div className="lg:col-span-2">
          <section className={PANEL + " mb-8"}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-2xl font-bold text-white">Order Items</h2>
              <Button
                onClick={handleAddItemClick}
                disabled={isReadOnly || isSavingItems}
                className="flex items-center gap-1 bg-yellow-500 text-black font-semibold rounded px-4 shadow hover:bg-yellow-400 no-print disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={16} />Add Item
              </Button>
            </div>
            <ul className="divide-y divide-gray-700">
              {order.items.map((item, idx) => (
                <li key={item.encryptedMenuItemId || idx} className="py-3 flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="font-semibold">{item.menuItemName}</span>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {item.quantity} x ₹{item.priceAtOrder.toFixed(2)}
                    </div>
                    {item.note && (
                      <div className="mt-1.5 flex items-start gap-1.5 bg-yellow-500/10 border border-yellow-500/25 rounded-lg px-2.5 py-1.5">
                        <span className="text-yellow-400 text-xs mt-0.5">📝</span>
                        <span className="text-yellow-200 text-xs leading-relaxed">{item.note}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-yellow-400 text-lg font-bold">₹{item.itemTotal.toFixed(2)}</span>
                    <Button
                      variant="ghost" size="sm"
                      disabled={isReadOnly || isSavingItems}
                      className="text-yellow-400 font-medium flex items-center gap-1 no-print disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => openEditModal(item)}
                    >Edit</Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-yellow-500/30 pt-4 mt-4 flex justify-between items-center">
              <p className="text-xl font-bold">Total</p>
              <p className="text-2xl font-bold font-mono text-yellow-400">
                ₹{order.totalAmount.toFixed(2)}
              </p>
            </div>
          </section>
        </div>
        {/* CUSTOMER PANEL */}
        <div>
          <section className={PANEL + " mb-8"}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-white">Customer Information</h3>
            </div>
            <div>
              <div className="text-yellow-400 font-semibold text-base">Customer Name:</div>
              <div className="font-bold text-white mb-2">{order.customerName}</div>
              <div className="text-yellow-400 font-semibold text-base">Phone Number:</div>
              <div className="font-bold text-white mb-2">{order.customerPhone}</div>
              <div className="text-yellow-400 font-semibold text-base">Table Name:</div>
              <div className="font-bold text-white mb-2">{order.restaurantTableName}</div>
            </div>
          </section>
          <section className={PANEL}>
            <div className="text-yellow-400 font-semibold text-base">Order Status:</div>
            <select
              className="mt-1 bg-gray-700 text-white font-bold py-2 px-3 rounded"
              value={order.status}
              onChange={e => handleStatusChange(e.target.value)}
            >
              {statusOptions.map(opt =>
                <option key={opt} value={opt}>{STATUS_MAP[opt]}</option>
              )}
            </select>
            <div className="mt-4">
              <div className="text-yellow-400 font-semibold text-base">Payment Mode:</div>
              <div className="font-bold text-white mb-2">{order.paymentMode}</div>
            </div>
          </section>
        </div>
      </div>
      {/* PLAIN BILL PRINT LAYOUT */}
      <div id="bill-print" style={{ display: "none" }}>
        <div className="bill-head">Bill No: #{order.billNumber}</div>
        <div>Date: {order.orderDate} {order.orderTime}</div>
        <div>Order Type: {order.orderType}</div>
        <div style={{ marginTop: '18px', marginBottom: '10px', fontWeight: "bold" }}>Order Items:</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Item</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  {item.menuItemName} ({item.quantity} × ₹{item.priceAtOrder.toFixed(2)})
                </td>
                <td style={{ textAlign: "right" }}>₹{item.itemTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bill-total" style={{ marginTop: '8px', borderTop: '1px solid #ddd', paddingTop: '6px' }}>
          Total: ₹{order.totalAmount.toFixed(2)}
        </div>
      </div>
      {/* Order item editing modal */}
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

export default OwnerOrderDetailPage;