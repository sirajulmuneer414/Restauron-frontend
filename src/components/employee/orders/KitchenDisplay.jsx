import React, { useState, useEffect } from 'react';
import { 
    Clock, CheckCircle, Flame, Bell, MapPin, ShoppingBag, Utensils, Timer, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmployeeService } from '../../../services/employeeService';
import { useWebSocket } from '../../../hooks/useWebSocket'; 

// --- DND KIT IMPORTS ---
import { DndContext, useDraggable, useDroppable, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- DRAGGABLE ORDER CARD ---
const DraggableOrderCard = ({ order, actionLabel, onAction }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: order.encryptedId,
        data: { ...order } // Pass order data for the overlay
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none', // Critical for mobile dragging
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
             <OrderCardContent order={order} actionLabel={actionLabel} onAction={onAction} />
        </div>
    );
};

// --- PURE COMPONENT FOR CONTENT (Reused by Draggable & Overlay) ---
const OrderCardContent = ({ order, actionLabel, onAction }) => {
    // Calculate Time Logic
    const getElapsedTime = (dateString) => {
        if (!dateString) return 'N/A';
        const diff = Math.floor((new Date() - new Date(dateString)) / 60000);
        return diff < 1 ? 'Just now' : `${diff} min ago`;
    };

    const getStatusColor = (status, timeElapsed) => {
        const isUrgent = status === 'PENDING' && timeElapsed > 20;
        if (isUrgent) return 'border-l-red-500 bg-red-50';
        switch (status) {
            case 'PENDING': return 'border-l-yellow-400 bg-white';
            case 'PREPARING': return 'border-l-blue-500 bg-white';
            case 'READY': return 'border-l-green-500 bg-white';
            default: return 'border-l-gray-300 bg-white';
        }
    };

    const start = new Date(order.orderDate);
    const diffMins = Math.floor((new Date() - start) / 60000);

    return (
        <div className={`p-4 rounded-lg shadow-sm border border-gray-100 border-l-4 mb-3 transition-all duration-300 hover:shadow-md bg-white ${getStatusColor(order.status, diffMins)} cursor-grab active:cursor-grabbing`}>
            <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-extrabold text-lg text-gray-800">#{order.billNumber || order.encryptedId.substring(0, 6)}</span>
                        {diffMins > 20 && order.status !== 'READY' && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Late</span>
                        )}
                    </div>
                    {order.orderType === 'TAKE_AWAY' ? (
                        <div className="flex items-center gap-1.5 text-orange-600 text-sm font-semibold mt-1">
                            <ShoppingBag size={14} />
                            <span className="truncate max-w-[150px]">{order.customerName || "Guest"}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold mt-1">
                            <MapPin size={14} />
                            <span>Table {order.restaurantTable?.name || "?"}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-full">
                    <Timer size={12} />
                    {getElapsedTime(order.orderDate)}
                </div>
            </div>
            <ul className="space-y-2 mb-4">
                {order.items && order.items.map((item, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-700">
                        <span className="font-bold text-gray-900 min-w-6">{item.quantity}x</span>
                        <span className="leading-tight">{item.menuItemName}</span>
                    </li>
                ))}
            </ul>
            {/* Note: We use onPointerDown to prevent drag start when clicking the button */}
            {actionLabel && (
                <button 
                    onPointerDown={(e) => e.stopPropagation()} 
                    onClick={() => onAction(order.encryptedId)}
                    className={`w-full py-2.5 rounded-md text-sm font-bold text-white transition transform active:scale-95 flex items-center justify-center gap-2
                        ${order.status === 'PENDING' ? 'bg-gray-900 hover:bg-black' : 
                          order.status === 'PREPARING' ? 'bg-blue-600 hover:bg-blue-700' : 
                          'bg-green-600 hover:bg-green-700'}`}
                >
                    {order.status === 'PREPARING' && <Flame size={16} className={order.status === 'PREPARING' ? "animate-pulse" : ""} />}
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

// --- DROPPABLE COLUMN ---
const DroppableColumn = ({ id, title, icon: Icon, count, colorTheme, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    // Dynamic styles based on isOver state (visual feedback when dragging over)
    const bgColors = {
        gray: isOver ? 'bg-gray-300' : 'bg-gray-200/60',
        blue: isOver ? 'bg-blue-100' : 'bg-blue-50/60',
        green: isOver ? 'bg-green-100' : 'bg-green-50/60'
    };
    
    const borderColors = {
        gray: isOver ? 'border-gray-400' : 'border-gray-200',
        blue: isOver ? 'border-blue-300' : 'border-blue-100',
        green: isOver ? 'border-green-300' : 'border-green-100'
    };

    const textColors = {
        gray: 'text-gray-600',
        blue: 'text-blue-700',
        green: 'text-green-700'
    };

    return (
        <div ref={setNodeRef} className={`flex flex-col h-[500px] md:h-full p-2 rounded-xl border transition-colors duration-200 ${bgColors[colorTheme]} ${borderColors[colorTheme]}`}>
            <div className="flex items-center justify-between mb-3 px-2 py-1 shrink-0">
                <h2 className={`font-bold flex items-center gap-2 uppercase text-xs tracking-wider ${textColors[colorTheme]}`}>
                    <Icon size={14} /> {title}
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/50 ${textColors[colorTheme]}`}>{count}</span>
            </div>
            <div className="overflow-y-auto flex-1 px-1 scrollbar-hide space-y-3">
                {children}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const KitchenDisplay = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDragItem, setActiveDragItem] = useState(null); // For overlay
    
    const employeeService = useEmployeeService();
    const { notifications } = useWebSocket(); 

    // Sensors handle mouse vs touch interactions
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    // --- FETCH DATA ---
    const fetchOrders = async () => {
        try {
            const data = await employeeService.getActiveOrders();
            setOrders(data);
        } catch (error) {
            console.error("KDS Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0]; 
            if (latest.type === 'REFRESH_ORDERS' || latest.type === 'NEW_ORDER') {
                fetchOrders(); 
            }
        }
    }, [notifications]);

    const handleStatusChange = async (orderId, newStatus) => {
        const previousOrders = [...orders];
        // Optimistic UI Update
        setOrders(orders.map(o => o.encryptedId === orderId ? { ...o, status: newStatus } : o));

        try {
            await employeeService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order moved to ${newStatus}`);
            // fetchOrders(); // Optional: Fetch to be 100% sure
        } catch (error) {
            setOrders(previousOrders); 
            toast.error("Failed to update status");
        }
    };

    // --- DND HANDLERS ---
    const handleDragStart = (event) => {
        const { active } = event;
        // Find the full order object based on ID to render the overlay
        const order = orders.find(o => o.encryptedId === active.id);
        setActiveDragItem(order);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return; // Dropped outside

        const orderId = active.id;
        const newStatus = over.id; // The column ID corresponds to status (PENDING, PREPARING, READY)

        const currentOrder = orders.find(o => o.encryptedId === orderId);

        if (currentOrder && currentOrder.status !== newStatus) {
            handleStatusChange(orderId, newStatus);
        }
    };

    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    const preparingOrders = orders.filter(o => o.status === 'PREPARING');
    const readyOrders = orders.filter(o => o.status === 'READY');

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-500 gap-2">
            <RefreshCw className="animate-spin" /> Loading Kitchen Display...
        </div>
    );

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="p-4 bg-gray-100 min-h-screen font-sans flex flex-col md:h-screen h-auto md:overflow-hidden overflow-y-auto">
                
                <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                            <Utensils size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Kitchen Display System</h1>
                            <p className="text-xs text-gray-500">Live Feed • <span className="text-green-600 font-bold">Real-time Active</span></p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center px-4 border-r border-gray-100">
                            <span className="block text-2xl font-bold text-gray-800">{orders.length}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Total</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 md:overflow-hidden min-h-0">
                    
                    {/* Column 1: PENDING */}
                    <DroppableColumn id="PENDING" title="Pending" icon={Bell} count={pendingOrders.length} colorTheme="gray">
                        {pendingOrders.map(order => (
                            <DraggableOrderCard 
                                key={order.encryptedId} 
                                order={order} 
                                actionLabel="Start Cooking" 
                                onAction={(id) => handleStatusChange(id, 'PREPARING')} 
                            />
                        ))}
                    </DroppableColumn>

                    {/* Column 2: PREPARING */}
                    <DroppableColumn id="PREPARING" title="Preparing" icon={Flame} count={preparingOrders.length} colorTheme="blue">
                        {preparingOrders.map(order => (
                            <DraggableOrderCard 
                                key={order.encryptedId} 
                                order={order} 
                                actionLabel="Mark Ready" 
                                onAction={(id) => handleStatusChange(id, 'READY')} 
                            />
                        ))}
                    </DroppableColumn>

                    {/* Column 3: READY */}
                    <DroppableColumn id="READY" title="Ready to Serve" icon={CheckCircle} count={readyOrders.length} colorTheme="green">
                        {readyOrders.map(order => (
                            <DraggableOrderCard 
                                key={order.encryptedId} 
                                order={order} 
                                actionLabel="Complete Order" 
                                onAction={(id) => handleStatusChange(id, 'COMPLETED')} 
                            />
                        ))}
                    </DroppableColumn>

                </div>

                {/* Drag Overlay: Shows the card following the mouse while dragging */}
                <DragOverlay>
                    {activeDragItem ? (
                        <div className="opacity-90 rotate-3 scale-105">
                             <OrderCardContent order={activeDragItem} actionLabel={null} />
                        </div>
                    ) : null}
                </DragOverlay>

            </div>
        </DndContext>
    );
};

export default KitchenDisplay;
