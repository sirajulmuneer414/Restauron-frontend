import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PlusCircle, Search, Eye } from 'lucide-react';
import { axiosOwnerInstance } from '../../../axios/instances/axiosInstances';
import Cookie from 'js-cookie';
import { Button } from '../../ui/button';

 // Assuming an owner-specific instance

// --- Pagination Component (Embedded for simplicity) ---
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


// --- CreateMenuItemModal Component (Embedded) ---
function CreateMenuItemModal({ isOpen, onClose, categories, onSuccess }) {
    const navigate = useNavigate();
    const restaurantName = useSelector((state) => state.ownerDetailsSlice.restaurantName);

    const [formData, setFormData] = useState({
        name: '', description: '', price: '', isVegetarian: false, categoryEncryptedId: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

const handleSubmit = async (e) => {
    console.log('Submitting form with data:', formData, 'and imageFile:', imageFile);
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    
    const folderName = restaurantName ? restaurantName.replace(/\s+/g, '_') : 'general-uploads';

    try {
        // Build FormData
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("price", parseFloat(formData.price));
        formDataToSend.append("isVegetarian", formData.isVegetarian);
        formDataToSend.append("categoryEncryptedId", formData.categoryEncryptedId);
        if (imageFile) formDataToSend.append("imageFile", imageFile);


        // Do NOT set Content-Type header manually; browser will handle boundary!
        await axiosOwnerInstance.post('/menu/create', formDataToSend,
             {
            onUploadProgress: (progressEvent) => {
                if (imageFile) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            }
        }
    );

        onSuccess();
        onClose();
    } catch (err) {
        console.error('Error creating menu item:', err);
        setError(err?.response?.data?.message || "Failed to create item. Please check your inputs.");
    } finally {
        setIsLoading(false);
    }
};

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg m-4">
                <h2 className="text-xl font-bold mb-6">Create New Menu Item</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <input name="name" onChange={handleChange} placeholder="Item Name" className="flex-1 bg-black/70 border border-gray-700 rounded-lg p-2.5" required />
                        <input name="price" type="number" step="0.01" onChange={handleChange} placeholder="Price" className="w-28 bg-black/70 border border-gray-700 rounded-lg p-2.5" required />
                    </div>
                    <textarea name="description" onChange={handleChange} placeholder="Item description..." rows="3" className="w-full bg-black/70 border border-gray-700 rounded-lg p-2.5"></textarea>
                    <div className="flex gap-4 items-center">
                        <select name="categoryEncryptedId" onChange={handleChange} className="flex-1 bg-black/70 border border-gray-700 rounded-lg p-2.5" required>
                            <option value="">Select a Category</option>
                            {categories.map(cat => <option key={cat.encryptedId} value={cat.encryptedId}>{cat.name}</option>)}
                        </select>
                        <label className="flex items-center gap-2"><input type="checkbox" name="isVegetarian" onChange={handleChange} /> Vegetarian</label>
                    </div>
                    <div>
                        <Button type="button" onClick={() => navigate('/owner/category')} className="text-sm text-yellow-400 bg-transparent p-0 hover:underline">Need a new category? Create one here.</Button>
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500/10 file:text-yellow-300 hover:file:bg-yellow-500/20"/>
                    
                    {isLoading && imageFile && (
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    )}
                    {error && <p className="text-red-400">{error}</p>}
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                            {isLoading ? 'Creating...' : 'Create Item'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// --- Main List Component ---
function MenuItemManagementList() {
    const navigate = useNavigate();

    // Data states
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Pagination & Search
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(8);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(0); }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [itemsResponse, categoriesResponse] = await Promise.all([
                axiosOwnerInstance.post('/menu/fetch-by-restaurant', { pageNo: page, size, search: debouncedSearch }),
                axiosOwnerInstance.post('/category/fetch-list', { pageNo: 0, size: 100 })
            ]);
            setMenuItems(itemsResponse.data.content || []);
            setTotalPages(itemsResponse.data.totalPages || 0);
            setCategories(categoriesResponse.data.content || []);
        } catch (err) {
            setError("Failed to load menu data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [page, size, debouncedSearch]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="container mx-auto p-4 text-white bg-linear-to-b from-black/60 to-gray-500 min-h-screen">
            <h1 className="text-3xl font-bold mb-2">Menu Item Management</h1>
            <p className="text-gray-400 mb-6">Add and manage all items on your menu.</p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 p-4 bg-black/50 border border-gray-800 rounded-xl">
                 <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by item name..."
                        className="w-full bg-black/70 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5"/>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold flex items-center gap-2">
                    <PlusCircle size={20} /> Add Menu Item
                </Button>
            </div>

            {error && <div className="text-red-400 text-center py-4">{error}</div>}

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-900/70">
                        <tr>
                            {['Item', 'Category', 'Price', 'Status', 'Actions'].map(h => <th key={h} className="py-3.5 px-4 text-left font-semibold">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {isLoading ? (
                            <tr><td colSpan="5" className="text-center py-10">Loading items...</td></tr>
                        ) : menuItems.map(item => (
                            <tr key={item.encryptedId} className="hover:bg-gray-800/50">
                                <td className="p-4 flex items-center gap-4">
                                    <img src={item.imageUrl || `https://via.placeholder.com/40`} alt={item.name} className="w-10 h-10 rounded-md object-cover"/>
                                    <div>
                                        <div className="font-bold">{item.name}</div>
                                        <div className="text-xs text-gray-400">{item.isVegetarian ? 'Veg' : 'Non-Veg'}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300">{item.categoryName}</td>
                                <td className="p-4 text-gray-300">${item.price.toFixed(2)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${item.available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {item.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <Button onClick={() => navigate(`/owner/menu/item/detail/${item.encryptedId}`)} className="bg-transparent text-white hover:bg-gray-700 flex items-center gap-2">
                                        <Eye size={16}/> View
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            )}
            
            <CreateMenuItemModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                categories={categories}
                onSuccess={fetchData}
            />
        </div>
    );
}

export default MenuItemManagementList;

