import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { Button } from '../../../components/ui/button';
import { Search, SlidersHorizontal, List } from 'lucide-react';

const RestaurantManagementList = () => {
    const navigate = useNavigate();

    // State declarations
    const [restaurantList, setRestaurantList] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { axiosAdminInstance } = useAxios();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(0);
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetching logic
    const fetchRestaurants = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosAdminInstance.post('/restaurants/fetch-list', {
                pageNo: page,
                size,
                filter,
                search: debouncedSearch || undefined,
            });

            if (response.status === 204) {
                setRestaurantList([]);
                setTotalPages(0);
                setTotalElements(0);
                setError('No restaurants found for the current criteria.');
            } else {
                const data = response.data;
                setRestaurantList(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while fetching data.');
            setRestaurantList([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, size, filter, debouncedSearch]);

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    // --- Navigation and Pagination Handlers ---
    const handleViewDetails = (restaurantId) => {
        navigate(`/admin/restaurants/details/${restaurantId}`);
    };

    const getStatusBadgeStyle = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-600/20 text-green-300 border-green-700/50';
            case 'NONACTIVE':
                return 'bg-red-600/20 text-red-300 border-red-700/50';
            case 'PENDING':
                return 'bg-amber-500/20 text-amber-300 border-amber-600/40';
            default:
                return 'bg-gray-600/20 text-gray-300 border-gray-700/50';
        }
    };

    const getAccessLevelBadgeStyle = (level) => {
        switch (level) {
            case 'FULL':
                return 'bg-green-600/20 text-green-300 border-green-700/50';
            case 'PARTIAL':
                return 'bg-amber-500/20 text-amber-300 border-amber-600/40';
            case 'READ_ONLY':
                return 'bg-orange-600/20 text-orange-300 border-orange-700/40';
            case 'BLOCKED':
                return 'bg-red-600/20 text-red-300 border-red-700/50';
            default:
                return 'bg-gray-600/20 text-gray-300 border-gray-700/50';
        }
    };

    const handlePageSizeChange = (e) => {
        setSize(Number(e.target.value));
        setPage(0);
    };

    const canGoPrev = page > 0;
    const canGoNext = page < totalPages - 1;
    const goFirst = () => setPage(0);
    const goPrev = () => setPage((p) => Math.max(0, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));
    const goLast = () => setPage(Math.max(0, totalPages - 1));
    const goToPage = (p) => setPage(p);

    // Page button logic
    const pageButtons = useMemo(() => {
        const buttons = [];
        const maxButtons = 7;
        if (totalPages <= maxButtons) {
            for (let i = 0; i < totalPages; i++) buttons.push(i);
            return buttons;
        }
        const first = 0;
        const last = totalPages - 1;
        const start = Math.max(first + 1, page - 2);
        const end = Math.min(last - 1, page + 2);
        const set = new Set([first]);
        for (let i = start; i <= end; i++) set.add(i);
        set.add(last);
        return Array.from(set).sort((a, b) => a - b);
    }, [page, totalPages]);


    return (
        <div className="container mx-auto p-4 text-white bg-linear-to-b from-black/60 to-gray-500 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Restaurant Management</h1>
                <p className="text-gray-400 mt-1">Manage and review all registered restaurants.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or owner"
                        className="bg-black/70 border border-gray-700 rounded-md pl-10 pr-4 py-2 w-full md:w-64 focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={16} className="text-gray-400" />
                        <select
                            value={filter}
                            onChange={(e) => { setFilter(e.target.value); setPage(0); }}
                            className="bg-black/70 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="NONACTIVE">Non-Active</option>
                            <option value="PENDING">Pending</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <List size={16} className="text-gray-400" />
                        <select
                            value={size}
                            onChange={handlePageSizeChange}
                            className="bg-black/70 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-linear-to-b from-black/70 to-black/60">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-900/70 text-white">
                                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Restaurant Name</th>
                                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Owner</th>
                                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Contact Email</th>
                                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Status</th>
                                <th className="py-3.5 px-4 text-left font-semibold border-b border-gray-800">Access Level</th>
                                <th className="py-3.5 px-4 text-center font-semibold border-b border-gray-800">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-800">
                            {isLoading ? (
                                Array.from({ length: size }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 bg-gray-700 rounded w-3/4"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-700 rounded w-1/2"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-700 rounded w-full"></div></td>
                                        <td className="p-4"><div className="h-6 bg-gray-700 rounded-full w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-700 rounded w-1/3"></div></td>
                                        <td className="p-4 flex justify-center"><div className="h-8 bg-gray-700 rounded w-28"></div></td>
                                    </tr>
                                ))
                            ) : restaurantList.length > 0 ? (
                                restaurantList.map((restaurant) => (
                                    <tr key={restaurant.encryptedId} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="py-3 px-4 font-medium">{restaurant.name}</td>
                                        <td className="py-3 px-4 text-gray-300">{restaurant.ownerName}</td>
                                        <td className="py-3 px-4 text-gray-300">{restaurant.email}</td>

                                        {/* Status Column */}
                                        <td className="py-3 px-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeStyle(restaurant.status)}`}>
                                                {restaurant.status}
                                            </span>
                                        </td>

                                        {/* Access Level Column */}
                                        <td className="py-3 px-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getAccessLevelBadgeStyle(restaurant.accessLevel)}`}>
                                                {restaurant.accessLevel || 'N/A'}
                                            </span>
                                        </td>

                                        <td className="py-3 px-4 text-center">
                                            <Button onClick={() => handleViewDetails(restaurant.encryptedId)} className="bg-amber-500 text-black font-semibold py-1.5 px-4 rounded-md text-xs">
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    {/* Note: Updated colSpan to 6 because you have 6 columns now */}
                                    <td colSpan="6" className="text-center p-10 text-gray-400">
                                        {error || 'No restaurants found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-800 px-4 py-3 bg-black/60">
                    <div className="text-xs text-gray-400">
                        Page {page + 1} of {Math.max(totalPages, 1)} ({totalElements} total results)
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <Button onClick={goFirst} disabled={!canGoPrev} variant="outline" size="sm">« First</Button>
                            <Button onClick={goPrev} disabled={!canGoPrev} variant="outline" size="sm">‹ Prev</Button>
                            {pageButtons.map((p, idx) => (
                                <React.Fragment key={p}>
                                    {idx > 0 && p - pageButtons[idx - 1] > 1 && <span className="text-gray-500 px-1">…</span>}
                                    <button onClick={() => goToPage(p)} className={`px-3 py-1 rounded-md text-xs font-semibold ${p === page ? 'bg-amber-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                        {p + 1}
                                    </button>
                                </React.Fragment>
                            ))}
                            <Button onClick={goNext} disabled={!canGoNext} variant="outline" size="sm">Next ›</Button>
                            <Button onClick={goLast} disabled={!canGoNext} variant="outline" size="sm">Last »</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantManagementList;

