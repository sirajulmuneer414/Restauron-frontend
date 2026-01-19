import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ListOrdered, PlusCircle, Search, Filter, Grid3x3, List, Calendar, User, CreditCard, Package } from 'lucide-react';
import { Button } from '../../ui/button';
import { useSelector } from 'react-redux';


const OwnerOrderManagementPage = () => {
    const { axiosOwnerInstance } = useAxios();
    const navigate = useNavigate();

    const [viewMode, setViewMode] = useState('table');
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    const user = useSelector((state) => state.userSlice?.user);
    const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';
    

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(0);
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosOwnerInstance.post('/orders', {
                page,
                size,
                status: filterStatus === 'ALL' ? undefined : filterStatus,
                type: filterType === 'ALL' ? undefined : filterType,
                search: debouncedSearch || undefined,
                sort: 'orderDate,desc'
            });

            if (response.status === 200 && response.data) {
                const data = response.data;
                setOrders(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
                setPage(data.number || 0);
                setSize(data.size || 10);
            } else if (response.status === 204) {
                setOrders([]);
                setTotalPages(0);
                setTotalElements(0);
            } else {
                setError('Failed to fetch orders.');
                toast.error("Failed to fetch orders.");
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            const errMsg = err?.response?.data?.message || 'An error occurred while fetching orders.';
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [page, size, filterStatus, filterType, debouncedSearch, axiosOwnerInstance]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const canGoPrev = page > 0;
    const canGoNext = page < totalPages - 1;
    const goFirst = () => setPage(0);
    const goPrev = () => setPage((p) => Math.max(0, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));
    const goLast = () => setPage(Math.max(0, totalPages - 1));
    const goTo = (p) => setPage(p);

    const onFilterStatusChange = (e) => {
        setFilterStatus(e.target.value);
        setPage(0);
    };

    const onFilterTypeChange = (e) => {
        setFilterType(e.target.value);
        setPage(0);
    };

    const pageButtons = useMemo(() => {
        const buttons = [];
        const maxButtons = 5;
        if (totalPages <= maxButtons) {
            for (let i = 0; i < totalPages; i++) buttons.push(i);
            return buttons;
        }
        const first = 0;
        const last = totalPages - 1;
        
        let start = Math.max(first, page - 2);
        let end = Math.min(last, page + 2);

        if (page - first < 2) {
            end = Math.min(last, first + maxButtons - 1);
        } else if (last - page < 2) {
            start = Math.max(first, last - maxButtons + 1);
        }
        
        if (start > first) {
            buttons.push(first);
            if(start > first + 1) buttons.push('...');
        }
        
        for (let i = start; i <= end; i++) {
            buttons.push(i);
        }
        
        if (end < last) {
            if(end < last - 1) buttons.push('...');
            buttons.push(last);
        }
        
        return buttons;
    }, [page, totalPages]);

    const getStatusStyles = (status) => {
        const lowerStatus = status.toUpperCase();
        switch (lowerStatus) {
            case 'COMPLETED':
                return 'bg-green-500/10 text-green-400 border-green-500/30 shadow-sm shadow-green-500/20';
            case 'CONFIRMED':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-sm shadow-blue-500/20';
            case 'PENDING':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-sm shadow-yellow-500/20';
            case 'PREPARING':
                return 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-sm shadow-orange-500/20';
            case 'READY':
                return 'bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-sm shadow-teal-500/20';
            case 'CANCELLED':
                return 'bg-red-500/10 text-red-400 border-red-500/30 shadow-sm shadow-red-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        }
    };

    const renderSkeletonRows = (count = 10) => (
        Array.from({ length: count }).map((_, i) => (
            <tr key={`sk-row-${i}`} className="border-b border-gray-800/50">
                <td className="p-4"><div className="h-4 bg-gray-800 rounded w-20 animate-pulse"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-800 rounded w-32 animate-pulse"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-800 rounded w-24 animate-pulse"></div></td>
                <td className="p-4"><div className="h-6 bg-gray-800 rounded-full w-28 animate-pulse"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-800 rounded w-20 animate-pulse"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-800 rounded w-24 animate-pulse"></div></td>
            </tr>
        ))
    );

    const renderSkeletonCards = (count = 10) => (
        Array.from({ length: count }).map((_, i) => (
            <div key={`sk-card-${i}`} className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-6 bg-gray-800 rounded w-32"></div>
                    <div className="h-6 bg-gray-800 rounded-full w-24"></div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                </div>
            </div>
        ))
    );

    return (
        <div className="p-4 md:p-8 text-white min-h-screen bg-linear-to-b from-black/60 to-gray-500">
            {/* Header */}
            <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                        <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
                            <ListOrdered className="text-yellow-500" size={32} />
                        </div>
                        Order Management
                    </h1>
                    <p className="text-gray-400 ml-16">Manage and track all your orders in one place</p>
                </div>
                <Button 
                    disabled={isReadOnly}
                    onClick={() => navigate('/owner/orders/new')} 
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                    <PlusCircle size={20} /> Add New Order
                </Button>
            </header>

            {/* Controls */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 mb-6 shadow-xl">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    {/* Search and Filters */}
                    <div className="flex-1 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by Bill No. or Customer..."
                                className="w-full bg-black/40 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <select
                                value={filterStatus}
                                onChange={onFilterStatusChange}
                                className="w-full md:w-48 appearance-none bg-black/40 border border-gray-700/50 rounded-xl pl-12 pr-10 py-3 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all cursor-pointer"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PREPARING">Preparing</option>
                                <option value="READY">Ready</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <select
                                value={filterType}
                                onChange={onFilterTypeChange}
                                className="w-full md:w-48 appearance-none bg-black/40 border border-gray-700/50 rounded-xl pl-12 pr-10 py-3 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all cursor-pointer"
                            >
                                <option value="ALL">All Types</option>
                                <option value="DINE_IN">Dine-In</option>
                                <option value="TAKE_AWAY">Take-Away</option>
                            </select>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-gray-700/50">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                viewMode === 'table'
                                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                        >
                            <List size={18} />
                            <span className="hidden sm:inline">Table</span>
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                viewMode === 'cards'
                                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                        >
                            <Grid3x3 size={18} />
                            <span className="hidden sm:inline">Cards</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-900/50 bg-red-900/20 text-red-300 px-6 py-4 backdrop-blur-sm">
                    {error}
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[768px]">
                            <thead className="border-b border-gray-700/50 bg-black/30">
                                <tr>
                                    <th className="p-5 text-gray-300 font-semibold">Bill No.</th>
                                    <th className="p-5 text-gray-300 font-semibold">Customer</th>
                                    <th className="p-5 text-gray-300 font-semibold">Type</th>
                                    <th className="p-5 text-gray-300 font-semibold">Status</th>
                                    <th className="p-5 text-gray-300 font-semibold">Total</th>
                                    <th className="p-5 text-gray-300 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? renderSkeletonRows(size) : orders.map((order) => (
                                    <tr 
                                        key={order.encryptedId} 
                                        className="border-b border-gray-800/30 hover:bg-gray-800/30 cursor-pointer transition-all group"
                                        onClick={() => navigate(`/owner/orders/${order.encryptedId}`)}
                                    >
                                        <td className="p-5 font-mono text-yellow-400 group-hover:text-yellow-300">{order.billNumber}</td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-gray-500" />
                                                {order.customerName || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-800/50 border border-gray-700/50">
                                                {order.orderType}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-4 py-1.5 text-xs font-semibold rounded-full border ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-5 font-semibold text-green-400">₹{order.totalAmount}</td>
                                        <td className="p-5 text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-500" />
                                                {new Date(order.orderDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Cards View */}
            {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? renderSkeletonCards(size) : orders.map((order) => (
                        <div
                            key={order.encryptedId}
                            onClick={() => navigate(`/owner/orders/${order.encryptedId}`)}
                            className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-200 cursor-pointer group hover:scale-105"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Bill Number</p>
                                    <p className="font-mono text-lg font-bold text-yellow-400 group-hover:text-yellow-300">
                                        {order.billNumber}
                                    </p>
                                </div>
                                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusStyles(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <User size={16} className="text-gray-500" />
                                    <span className="text-sm">{order.customerName || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Package size={16} className="text-gray-500" />
                                    <span className="text-sm">{order.orderType}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar size={16} className="text-gray-500" />
                                    <span className="text-sm">{new Date(order.orderDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-sm">Total Amount</span>
                                    <span className="text-xl font-bold text-green-400">₹{order.totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && orders.length === 0 && (
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-16 text-center">
                    <div className="bg-gray-800/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ListOrdered size={40} className="text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2">No Orders Found</h3>
                    <p className="text-gray-400 mb-6">Try adjusting your filters or add a new order to get started.</p>
                  <Button 
                    onClick={() => navigate('/owner/orders/new')} 
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                    <PlusCircle size={20} /> Add New Order
                </Button>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && orders.length > 0 && totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                    <p className="text-sm text-gray-400">
                        Showing <span className="text-white font-semibold">{orders.length}</span> of{' '}
                        <span className="text-white font-semibold">{totalElements}</span> orders
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={goFirst}
                            disabled={!canGoPrev}
                            className="bg-black/40 border border-gray-700/50 text-white hover:bg-yellow-500 hover:text-black hover:border-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all px-3 py-2 rounded-lg"
                        >
                            «
                        </Button>
                        <Button
                            onClick={goPrev}
                            disabled={!canGoPrev}
                            className="bg-black/40 border border-gray-700/50 text-white hover:bg-yellow-500 hover:text-black hover:border-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all px-3 py-2 rounded-lg"
                        >
                            ‹
                        </Button>
                        {pageButtons.map((p, idx) => (
                            <React.Fragment key={idx}>
                                {typeof p === 'string' ? (
                                    <span className="text-gray-500 px-2">...</span>
                                ) : (
                                    <button
                                        onClick={() => goTo(p)}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                            p === page
                                                ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20'
                                                : 'bg-black/40 border-gray-700/50 hover:border-yellow-500/50 hover:bg-gray-800/50'
                                        }`}
                                    >
                                        {p + 1}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}
                        <Button
                            onClick={goNext}
                            disabled={!canGoNext}
                            className="bg-black/40 border border-gray-700/50 text-white hover:bg-yellow-500 hover:text-black hover:border-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all px-3 py-2 rounded-lg"
                        >
                            ›
                        </Button>
                        <Button
                            onClick={goLast}
                            disabled={!canGoNext}
                            className="bg-black/40 border border-gray-700/50 text-white hover:bg-yellow-500 hover:text-black hover:border-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all px-3 py-2 rounded-lg"
                        >
                            »
                        </Button>
                    </div>
                </div>
            )}

          
        </div>
    );
};

export default OwnerOrderManagementPage;
