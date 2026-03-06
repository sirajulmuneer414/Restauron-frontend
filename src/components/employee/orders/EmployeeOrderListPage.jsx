import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEmployeeService } from '../../../services/employeeService';
import toast from 'react-hot-toast';
import {
    ListOrdered, Search, Filter, Package,
    Grid3x3, List, Calendar, User, Lock
} from 'lucide-react';

const STATUS_STYLES = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    CONFIRMED: 'bg-blue-500/10   text-blue-400   border-blue-500/30',
    PREPARING: 'bg-orange-500/10 text-orange-400  border-orange-500/30',
    READY: 'bg-teal-500/10   text-teal-400    border-teal-500/30',
    COMPLETED: 'bg-green-500/10  text-green-400   border-green-500/30',
    CANCELLED: 'bg-red-500/10    text-red-400     border-red-500/30',
};

const EmployeeOrderListPage = () => {
    const navigate = useNavigate();
    const employeeService = useEmployeeService();
    const user = useSelector((s) => s.userSlice?.user);
    const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');

    // Pagination
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [sort, setSort] = useState('orderDate,desc');

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(0); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await employeeService.getOrdersPage({
                page,
                size,
                status: filterStatus || undefined,
                type: filterType || undefined,
                search: debouncedSearch || undefined,
                sort,
            });
            setOrders(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to fetch orders.');
        } finally {
            setIsLoading(false);
        }
    }, [page, size, filterStatus, filterType, debouncedSearch, sort]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // Pagination helpers
    const canPrev = page > 0;
    const canNext = page < totalPages - 1;

    const pageButtons = useMemo(() => {
        const btns = [];
        const max = 5;
        if (totalPages <= max) { for (let i = 0; i < totalPages; i++) btns.push(i); return btns; }
        const first = 0, last = totalPages - 1;
        let start = Math.max(first, page - 2), end = Math.min(last, page + 2);
        if (page - first < 2) end = Math.min(last, first + max - 1);
        else if (last - page < 2) start = Math.max(first, last - max + 1);
        if (start > first) { btns.push(first); if (start > first + 1) btns.push('...'); }
        for (let i = start; i <= end; i++) btns.push(i);
        if (end < last) { if (end < last - 1) btns.push('...'); btns.push(last); }
        return btns;
    }, [page, totalPages]);

    const statusStyle = (s) => STATUS_STYLES[s] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';

    const SkeletonRow = () => (
        <tr className="border-b border-gray-800/50">
            {[...Array(5)].map((_, i) => (
                <td key={i} className="p-4"><div className="h-4 bg-gray-800 rounded animate-pulse w-28" /></td>
            ))}
        </tr>
    );

    const SkeletonCard = () => (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5 animate-pulse">
            <div className="h-5 bg-gray-800 rounded w-1/2 mb-3" />
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
        </div>
    );

    return (
        <div className="p-4 md:p-8 text-white min-h-screen bg-gradient-to-b from-black/70 to-gray-900">

            {/* READ-ONLY banner */}
            {isReadOnly && (
                <div className="flex items-center gap-2 bg-red-600/90 text-white px-5 py-3 rounded-xl mb-6 text-sm font-semibold">
                    <Lock size={16} /> Read-Only Mode — viewing orders only
                </div>
            )}

            {/* Header */}
            <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
                        <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
                            <ListOrdered className="text-yellow-500" size={28} />
                        </div>
                        Order Management
                    </h1>
                    <p className="text-gray-400 ml-16">Search, filter and manage all restaurant orders</p>
                </div>
            </header>

            {/* Controls */}
            <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-5 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    {/* Search + filters */}
                    <div className="flex-1 flex flex-col md:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by bill no., customer name…"
                                className="w-full bg-black/40 border border-gray-700/50 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all text-sm"
                            />
                        </div>

                        {/* Status */}
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <select
                                value={filterStatus}
                                onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                                className="w-full md:w-44 appearance-none bg-black/40 border border-gray-700/50 rounded-xl pl-11 pr-8 py-3 focus:outline-none focus:border-yellow-500/50 transition-all cursor-pointer text-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PREPARING">Preparing</option>
                                <option value="READY">Ready</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        {/* Type */}
                        <div className="relative">
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <select
                                value={filterType}
                                onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
                                className="w-full md:w-44 appearance-none bg-black/40 border border-gray-700/50 rounded-xl pl-11 pr-8 py-3 focus:outline-none focus:border-yellow-500/50 transition-all cursor-pointer text-sm"
                            >
                                <option value="">All Types</option>
                                <option value="DINE_IN">Dine-In</option>
                                <option value="TAKEAWAY">Takeaway</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <select
                            value={sort}
                            onChange={(e) => { setSort(e.target.value); setPage(0); }}
                            className="w-full md:w-48 appearance-none bg-black/40 border border-gray-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all cursor-pointer text-sm"
                        >
                            <option value="orderDate,desc">Latest First</option>
                            <option value="orderDate,asc">Oldest First</option>
                            <option value="totalAmount,desc">Highest Amount</option>
                            <option value="totalAmount,asc">Lowest Amount</option>
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-gray-700/50 self-start">
                        {['table', 'cards'].map((m) => (
                            <button
                                key={m}
                                onClick={() => setViewMode(m)}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm capitalize ${viewMode === m
                                        ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                    }`}
                            >
                                {m === 'table' ? <List size={16} /> : <Grid3x3 size={16} />}
                                <span className="hidden sm:inline">{m === 'table' ? 'Table' : 'Cards'}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden shadow-xl mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[640px]">
                            <thead className="border-b border-gray-700/50 bg-black/30">
                                <tr>
                                    {['Bill No.', 'Customer', 'Type', 'Status', 'Total', 'Date'].map((h) => (
                                        <th key={h} className="p-5 text-gray-300 font-semibold text-sm">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading
                                    ? [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                                    : orders.map((o) => (
                                        <tr
                                            key={o.encryptedId}
                                            onClick={() => navigate(`/employee/orders/${o.encryptedId}`)}
                                            className="border-b border-gray-800/30 hover:bg-gray-800/30 cursor-pointer transition-all group"
                                        >
                                            <td className="p-5 font-mono text-yellow-400 group-hover:text-yellow-300 text-sm">{o.billNumber}</td>
                                            <td className="p-5 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-gray-500" />
                                                    {o.customerName || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-800/50 border border-gray-700/50">
                                                    {o.orderType}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusStyle(o.status)}`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="p-5 font-semibold text-green-400 text-sm">₹{o.totalAmount}</td>
                                            <td className="p-5 text-gray-400 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-gray-500" />
                                                    {new Date(o.orderDate).toLocaleDateString()}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
                    {isLoading
                        ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
                        : orders.map((o) => (
                            <div
                                key={o.encryptedId}
                                onClick={() => navigate(`/employee/orders/${o.encryptedId}`)}
                                className="bg-gray-900/70 border border-gray-800/50 rounded-2xl p-5 hover:border-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/10 transition-all cursor-pointer group hover:scale-[1.02]"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Bill Number</p>
                                        <p className="font-mono font-bold text-yellow-400 group-hover:text-yellow-300">{o.billNumber}</p>
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusStyle(o.status)}`}>
                                        {o.status}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <div className="flex items-center gap-2"><User size={13} className="text-gray-500" />{o.customerName || 'N/A'}</div>
                                    <div className="flex items-center gap-2"><Package size={13} className="text-gray-500" />{o.orderType}</div>
                                    <div className="flex items-center gap-2"><Calendar size={13} className="text-gray-500" />{new Date(o.orderDate).toLocaleDateString()}</div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-800/50 flex justify-between">
                                    <span className="text-xs text-gray-500">Total</span>
                                    <span className="font-bold text-green-400">₹{o.totalAmount}</span>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && orders.length === 0 && (
                <div className="bg-gray-900/70 border border-gray-800/50 rounded-2xl p-16 text-center">
                    <div className="bg-gray-800/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ListOrdered size={32} className="text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
                    <p className="text-gray-400 text-sm">Try adjusting your filters or search query.</p>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-900/70 border border-gray-800/50 rounded-2xl p-5">
                    <p className="text-sm text-gray-400">
                        Showing <span className="text-white font-semibold">{orders.length}</span> of{' '}
                        <span className="text-white font-semibold">{totalElements}</span> orders
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(0)} disabled={!canPrev} className="px-3 py-2 rounded-lg border border-gray-700/50 bg-black/40 hover:bg-yellow-500 hover:text-black disabled:opacity-30 transition text-sm">«</button>
                        <button onClick={() => setPage((p) => p - 1)} disabled={!canPrev} className="px-3 py-2 rounded-lg border border-gray-700/50 bg-black/40 hover:bg-yellow-500 hover:text-black disabled:opacity-30 transition text-sm">‹</button>
                        {pageButtons.map((p, i) =>
                            typeof p === 'string'
                                ? <span key={`d-${i}`} className="text-gray-500 px-2">…</span>
                                : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${p === page
                                                ? 'bg-yellow-500 text-black border-yellow-500'
                                                : 'bg-black/40 border-gray-700/50 hover:border-yellow-500/50'
                                            }`}
                                    >{p + 1}</button>
                                )
                        )}
                        <button onClick={() => setPage((p) => p + 1)} disabled={!canNext} className="px-3 py-2 rounded-lg border border-gray-700/50 bg-black/40 hover:bg-yellow-500 hover:text-black disabled:opacity-30 transition text-sm">›</button>
                        <button onClick={() => setPage(totalPages - 1)} disabled={!canNext} className="px-3 py-2 rounded-lg border border-gray-700/50 bg-black/40 hover:bg-yellow-500 hover:text-black disabled:opacity-30 transition text-sm">»</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeOrderListPage;
