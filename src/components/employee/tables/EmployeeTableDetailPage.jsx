import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosEmployeeInstance } from '../../../axios/instances/axiosInstances';
import { ArrowLeft, Users, ChevronDown, ExternalLink, ClipboardList } from 'lucide-react';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    AVAILABLE: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/40', dot: 'bg-green-400' },
    OCCUPIED: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/40', dot: 'bg-red-400' },
    RESERVED: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40', dot: 'bg-yellow-400' },
    OUT_OF_SERVICE: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/40', dot: 'bg-gray-400' },
};

const ORDER_STATUS_COLORS = {
    PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    PREPARING: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    READY: 'bg-green-500/20 text-green-300 border-green-500/40',
    COMPLETED: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
    CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/40',
};

const ALL_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_SERVICE'];

const EmployeeTableDetailPage = () => {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const [tableData, setTableData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchTableDetail = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosEmployeeInstance.get(`/tables/${tableId}`);
            setTableData(response.data);
        } catch (err) {
            toast.error('Failed to load table details. ' + (err.response?.data?.message || ''));
        } finally {
            setIsLoading(false);
        }
    }, [tableId]);

    useEffect(() => { fetchTableDetail(); }, [fetchTableDetail]);

    const handleStatusUpdate = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            const response = await axiosEmployeeInstance.put(`/tables/${tableId}/status`, newStatus, {
                headers: { 'Content-Type': 'text/plain' },
            });
            setTableData(prev => ({ ...prev, status: response.data.status }));
            toast.success(`Table status updated to ${newStatus.replace('_', ' ')}`);
        } catch (err) {
            toast.error('Failed to update status. ' + (err.response?.data?.message || ''));
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (isLoading) return <CommonLoadingSpinner />;
    if (!tableData) return null;

    const colors = STATUS_COLORS[tableData.status] || STATUS_COLORS.AVAILABLE;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black p-6 text-white">
            <div className="max-w-3xl mx-auto">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/employee/tables')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={18} /> Back to Tables
                </button>

                {/* Table Header Card */}
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">{tableData.name}</h1>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                <Users size={14} />
                                <span>{tableData.capacity} Seats</span>
                            </div>
                        </div>

                        {/* Status Badge + Updater */}
                        <div className="flex flex-col items-end gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${colors.bg} ${colors.text} ${colors.border}`}>
                                <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                                {tableData.status?.replace('_', ' ')}
                            </span>
                            <div className="relative">
                                <select
                                    value={tableData.status}
                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                    disabled={updatingStatus}
                                    className="appearance-none bg-black/60 border border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-amber-500 disabled:opacity-50 cursor-pointer"
                                >
                                    {ALL_STATUSES.map(s => (
                                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                    ))}
                                </select>
                                <ChevronDown size={13} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <ClipboardList size={20} className="text-amber-400" />
                        <h2 className="text-lg font-semibold">Orders at this table</h2>
                        <span className="ml-auto text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                            {tableData.orders?.length ?? 0} order{tableData.orders?.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {tableData.orders?.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <ClipboardList size={36} className="mx-auto mb-3 text-gray-700" />
                            <p>No orders at this table</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {tableData.orders.map(order => (
                                <div
                                    key={order.orderId}
                                    className="flex items-center justify-between bg-black/40 border border-gray-800 rounded-xl px-4 py-3 hover:border-gray-600 transition-colors"
                                >
                                    <div>
                                        <p className="font-semibold text-white">{order.billNumber}</p>
                                        <p className="text-sm text-gray-400 mt-0.5">{order.customerName}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                                            {order.status}
                                        </span>
                                        <button
                                            onClick={() => navigate(`/employee/orders/${order.encryptedOrderId}`)}
                                            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/60 rounded-lg px-3 py-1.5 transition-colors"
                                        >
                                            <ExternalLink size={12} /> Open
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default EmployeeTableDetailPage;
