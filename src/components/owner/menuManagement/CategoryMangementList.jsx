import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { Button } from '../../ui/button';

function CategoryManagementList() {
    const navigate = useNavigate();
    const {axiosOwnerInstance} = useAxios(); // Assuming an owner-specific instance
    // Data
    const [categoryList, setCategoryList] = useState([]);
    const [error, setError] = useState(null);

    // UI & Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(true);

    // Pagination (0-based for Spring)
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(6);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Search
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal state for creating a category
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [createError, setCreateError] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(0);
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch category data from the backend
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // NOTE: The Cookie and header logic from your previous request is removed here
            // as you indicated it was not needed in this specific file.
            const response = await axiosOwnerInstance.post('/category/fetch-list', {
                pageNo: page,
                size: size,
                search: debouncedSearch,
            });

            if (response.status === 200 && response.data) {
                const data = response.data;
                setCategoryList(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            } else if (response.status === 204) {
                setCategoryList([]);
                setTotalPages(0);
                setTotalElements(0);
            } else {
                setError('Failed to fetch the category list.');
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err?.response?.data?.message || 'An error occurred while fetching the category list.');
        } finally {
            setIsLoading(false);
            setShowSkeleton(false);
        }
    }, [page, size, debouncedSearch]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);


    // --- Navigation ---
    const handleCategoryClick = (encryptedId) => {
        navigate(`/owner/category/detail/${encryptedId}`);
    };


    // --- Modal Logic ---
    const openCreateModal = () => {
        setNewCategoryName('');
        setNewCategoryDescription('');
        setCreateError(null);
        setIsModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsModalOpen(false);
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            setCreateError("Category name cannot be empty.");
            return;
        }

        setIsCreating(true);
        setCreateError(null);
        try {
            await axiosOwnerInstance.post('/category/create', {
                name: newCategoryName,
                description: newCategoryDescription,
            });
            closeCreateModal();
            fetchCategories(); // Refresh the list after creation
        } catch (err) {
            console.error("Failed to create category:", err);
            setCreateError(err?.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setIsCreating(false);
        }
    };


    // --- Pagination Logic ---
    const canGoPrev = page > 0;
    const canGoNext = page < totalPages - 1;
    const goFirst = () => setPage(0);
    const goPrev = () => setPage((p) => Math.max(0, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));
    const goLast = () => setPage(Math.max(0, totalPages - 1));
    const goTo = (p) => setPage(p);

    const pageButtons = useMemo(() => {
        const buttons = [];
        const maxButtons = 5;
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

    const getStatusStyles = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-500/20 text-green-300 border-green-600/50';
            case 'UNAVAILABLE': return 'bg-red-500/20 text-red-300 border-red-600/50';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-600/50';
        }
    }

    const renderSkeletonGrid = (count = 6) => (
        Array.from({ length: count }).map((_, i) => (
            <div key={`sk-grid-${i}`} className="bg-black/40 border border-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
        ))
    );

    return (
        <div className="container mx-auto p-4 text-white bg-linear-to-b from-black/60 to-gray-500 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Category Management</h1>
                <p className="text-gray-400">Organize your menu by creating and managing categories.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
                <div className="flex-1 flex w-full">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by category name..."
                            className="w-full bg-black/70 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={openCreateModal} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2.5 px-4 rounded-lg flex items-center gap-2">
                        <PlusCircle size={20} /> Create Category
                    </Button>
                </div>
            </div>

            {error && <div className="mb-4 rounded-lg border border-red-900 bg-red-900/30 text-red-300 px-4 py-3">{error}</div>}

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading && showSkeleton ? renderSkeletonGrid(size) : categoryList.map(cat => (
                    // **MODIFICATION HERE: Added onClick handler**
                    <div
                        key={cat.encryptedId}
                        onClick={() => handleCategoryClick(cat.encryptedId)}
                        className="cursor-pointer bg-gradient-to-br from-black/60 to-gray-900/40 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-yellow-500/30 transition-all duration-300"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold">{cat.name}</h3>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(cat.status)}`}>{cat.status}</span>
                            </div>
                            <p className="text-sm text-gray-400 mb-4 h-10 overflow-hidden">{cat.description || 'No description provided.'}</p>
                        </div>
                        <div className="text-xs text-gray-500 border-t border-gray-800 pt-3 mt-3">
                            {cat.menuItemsPresent} items in this category
                        </div>
                    </div>
                ))}
            </div>


            {/* Empty State and Pagination */}
            {!isLoading && categoryList.length === 0 ? (
                <div className="p-10 text-center text-gray-300">
                    <h3 className="text-xl font-semibold text-white mb-2">No Categories Found</h3>
                    <p>Try adjusting your search or create a new category to get started.</p>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-6">
                    <p className="text-sm text-gray-400">Showing {categoryList.length} of {totalElements} categories</p>
                    <div className="flex items-center gap-1">
                        <Button onClick={goFirst} disabled={!canGoPrev} className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40">&laquo;</Button>
                        <Button onClick={goPrev} disabled={!canGoPrev} className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40">&lsaquo;</Button>
                        {pageButtons.map((p, idx) => (
                            <React.Fragment key={p}>
                                {idx > 0 && p - pageButtons[idx - 1] > 1 && <span className="text-gray-500 px-1">...</span>}
                                <button onClick={() => goTo(p)} className={`px-4 py-2 rounded-md border text-sm ${p === page ? 'bg-amber-500 text-black border-amber-500' : 'bg-black/70 border-gray-700 hover:border-amber-500'}`}>{p + 1}</button>
                            </React.Fragment>
                        ))}
                        <Button onClick={goNext} disabled={!canGoNext} className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40">&rsaquo;</Button>
                        <Button onClick={goLast} disabled={!canGoNext} className="bg-transparent border border-white/30 text-white hover:bg-amber-500 hover:text-black disabled:opacity-40">&raquo;</Button>
                    </div>
                </div>
            )}

            {/* Create Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md m-4">
                        <h2 className="text-xl font-bold mb-4">Create a New Category</h2>
                        <form onSubmit={handleCreateCategory}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-300 mb-1">Name <span className="text-red-500">*</span></label>
                                    <input
                                        id="categoryName"
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="e.g., Appetizers, Main Course"
                                        className="w-full bg-black/70 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                    <textarea
                                        id="categoryDescription"
                                        value={newCategoryDescription}
                                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                                        placeholder="A short description of the category (optional)"
                                        rows="3"
                                        className="w-full bg-black/70 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30"
                                    />
                                </div>
                                {createError && <p className="text-red-400 text-sm">{createError}</p>}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" onClick={closeCreateModal} disabled={isCreating} className="bg-transparent border border-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isCreating} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg">
                                    {isCreating ? 'Creating...' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategoryManagementList;

