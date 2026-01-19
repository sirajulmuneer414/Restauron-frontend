import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash, Package, Utensils, AlertTriangle } from 'lucide-react';
import { axiosOwnerInstance } from '../../../axios/instances/axiosInstances';
import Cookie from 'js-cookie';
import { Button } from '../../ui/button';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

// --- Reusable Pagination Component ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePageClick = (page) => {
        if (page >= 0 && page < totalPages) {
            onPageChange(page);
        }
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
        const start = Math.max(first + 1, currentPage - 2);
        const end = Math.min(last - 1, currentPage + 2);
        const set = new Set([first]);
        if (start > 1) set.add('...');
        for (let i = start; i <= end; i++) set.add(i);
        if (end < last - 1) set.add('...');
        set.add(last);
        return Array.from(set);
    }, [currentPage, totalPages]);

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            <Button onClick={() => handlePageClick(0)} disabled={currentPage === 0}>&laquo;</Button>
            <Button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 0}>&lsaquo;</Button>
            {pageButtons.map((p, idx) =>
                p === '...' ? (
                    <span key={`dots-${idx}`} className="px-4 py-2">...</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => handlePageClick(p)}
                        className={`px-4 py-2 rounded-md border text-sm ${p === currentPage ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black/70 border-gray-700 hover:border-amber-500'}`}
                    >
                        {p + 1}
                    </button>
                )
            )}
            <Button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage >= totalPages - 1}>&rsaquo;</Button>
            <Button onClick={() => handlePageClick(totalPages - 1)} disabled={currentPage >= totalPages - 1}>&raquo;</Button>
        </div>
    );
};


// --- Modal Components (ConfirmationModal, EditCategoryModal) remain the same ---
// ... (You can copy them from the previous response)
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md m-4">
                <div className="flex items-start gap-4">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg leading-6 font-bold text-white">{title}</h3>
                        <p className="text-sm text-gray-400 mt-2">{message}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={onClose} disabled={isLoading} className="bg-transparent border border-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg">
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const EditCategoryModal = ({ isOpen, onClose, category, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('UNAVAILABLE');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description || '');
            setStatus(category.status);
        }
    }, [category]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Category name cannot be empty.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // This function is passed from the parent to handle the API call
            await onSave({ name, description, status });
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to update category.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md m-4">
                <h2 className="text-xl font-bold mb-4">Edit Category</h2>
                <form onSubmit={handleSave}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-300 mb-1">Name <span className="text-red-500">*</span></label>
                            <input id="categoryName" type="text" value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/70 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-yellow-500" />
                        </div>
                        <div>
                            <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                            <textarea id="categoryDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                                className="w-full bg-black/70 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-yellow-500" />
                        </div>
                        <div>
                            <label htmlFor="categoryStatus" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                            <select id="categoryStatus" value={status} onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-black/70 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-yellow-500">
                                <option value="AVAILABLE">Available</option>
                                <option value="UNAVAILABLE">Unavailable</option>
                            </select>
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" onClick={onClose} disabled={isLoading} className="bg-transparent border border-gray-600 hover:bg-gray-700">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Page Component ---
function CategoryDetailPage() {
    const { categoryEncryptedId } = useParams();
    const navigate = useNavigate();

    // Data states
    const [category, setCategory] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Menu Item Pagination State
    const [menuPage, setMenuPage] = useState(0);
    const [menuPageSize, setMenuPageSize] = useState(6); // 3 columns, 2 rows
    const [menuTotalPages, setMenuTotalPages] = useState(0);
    const [menuTotalElements, setMenuTotalElements] = useState(0);

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const user = useSelector((state) => state.userSlice?.user);
    const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';

    const getStatusStyles = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-500/20 text-green-300 border-green-600/50';
            case 'UNAVAILABLE': return 'bg-red-500/20 text-red-300 border-red-600/50';
            default: return 'bg-gray-500/20 text-gray-300 border-gray-600/50';
        }
    }

    // Fetch category and associated menu items
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const restaurantId = Cookie.get("restaurantId"); // Assuming you have this cookie

            // Using Promise.all to fetch data concurrently
            const [categoryResponse, menuItemsResponse] = await Promise.all([
                axiosOwnerInstance.get(`/category/fetch/${categoryEncryptedId}`),
                axiosOwnerInstance.post(`/menu/fetch-by-category/${categoryEncryptedId}`,
                    { pageNo: menuPage, size: menuPageSize, search: "" }
                )
            ]);

            if (categoryResponse.status === 200) {
                setCategory(categoryResponse.data);
            }
            if (menuItemsResponse.status === 200) {
                const menuData = menuItemsResponse.data;
                setMenuItems(menuData.content || []);
                setMenuTotalPages(menuData.totalPages || 0);
                setMenuTotalElements(menuData.totalElements || 0);
            }

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err?.response?.data?.message || 'Failed to load category details.');
        } finally {
            setIsLoading(false);
        }
    }, [categoryEncryptedId, menuPage, menuPageSize]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Handlers for Edit, Delete (remain the same) ---
    const handleSaveChanges = async (updatedData) => {
        if (isReadOnly) {
            toast.error("Cannot edit category in Read-Only mode.");
            return; // Prevent action in read-only mode     
        }

        await axiosOwnerInstance.put(`/category/update/${categoryEncryptedId}`, {
            name: updatedData.name,
            description: updatedData.description,
        });

        await axiosOwnerInstance.patch(`/category/update-status/${categoryEncryptedId}`, {
            status: updatedData.status,
        });

        fetchData(); // Refresh data after saving
    };


    const handleDeleteCategory = async () => {
        if (isReadOnly) {
            toast.error("Cannot delete category in Read-Only mode.");
            return; // Prevent action in read-only mode     
        }
        setIsDeleting(true);
        try {

            await axiosOwnerInstance.delete(`/category/delete/${categoryEncryptedId}`);
            navigate('/owner/categories'); // Navigate back to the list after deletion
        } catch (err) {
            console.error("Failed to delete category:", err);
            setError(err?.response?.data?.message || "An error occurred during deletion.");
            setIsDeleteModalOpen(false); // Close modal on error to show the message
        } finally {
            setIsDeleting(false);
        }
    };


    if (isLoading && !category) { // Show initial loading state
        return <div className="text-center p-10 text-white">Loading category details...</div>;
    }

    if (error) {
        return <div className="p-10 rounded-lg border border-red-900 bg-red-900/30 text-red-300 text-center">{error}</div>;
    }

    if (!category) {
        return <div className="text-center p-10 text-white">Category not found.</div>;
    }

    return (
        <div className="container mx-auto p-4 text-white">
            {/* Header and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold">{category.name}</h1>
                    <p className="text-gray-400 mt-1 max-w-2xl">{category.description || 'No description available.'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsEditModalOpen(true)} className="bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black">
                        <Edit size={16} /> Edit
                    </Button>
                    <Button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-600 hover:text-white">
                        <Trash size={16} /> Delete
                    </Button>
                </div>
            </div>

            {/* Category Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-400 mb-2">Status</h3>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusStyles(category.status)}`}>{category.status}</span>
                </div>
                <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-400 mb-2">Menu Items</h3>
                    <p className="text-2xl font-bold flex items-center gap-2"><Package size={24} /> {menuTotalElements}</p>
                </div>
            </div>

            {/* Menu Items Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Menu Items in this Category</h2>
                {isLoading && menuItems.length === 0 ? (
                    <p className="text-center py-10">Loading menu items...</p>
                ) : menuItems.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {menuItems.map(item => (
                                <div key={item.encryptedId} className="bg-gradient-to-br from-black/60 to-gray-900/40 border border-gray-800 rounded-xl p-4 flex gap-4 items-center">
                                    <Utensils size={32} className="text-yellow-400 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <h4 className="font-bold">{item.name}</h4>
                                        <p className="text-sm text-gray-400">${item.price.toFixed(2)}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {item.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {menuTotalPages > 1 && (
                            <Pagination currentPage={menuPage} totalPages={menuTotalPages} onPageChange={setMenuPage} />
                        )}
                    </>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-xl">
                        <p className="text-gray-400">No menu items have been added to this category yet.</p>
                    </div>
                )}
            </div>

            {/* Modals will go here */}
            <EditCategoryModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                category={category}
                onSave={handleSaveChanges}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteCategory}
                isLoading={isDeleting}
                title="Delete Category"
                message={`Are you sure you want to delete the "${category.name}" category? This action cannot be undone.`}
            />

        </div>
    );
}

export default CategoryDetailPage;

