import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Edit, Trash, ToggleLeft, ToggleRight, AlertTriangle, Leaf, Drumstick } from 'lucide-react';
import { axiosOwnerInstance } from '../../../axios/instances/axiosInstances';
import { Button } from '../../ui/button';
import toast from 'react-hot-toast';


// --- Helper: Confirmation Modal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md m-4 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="text-lg font-bold text-white mt-4">{title}</h3>
                <p className="text-sm text-gray-400 my-2">{message}</p>
                <div className="flex justify-center gap-3 mt-6">
                    <Button onClick={onClose} disabled={isLoading} className="bg-transparent border border-gray-600">Cancel</Button>
                    <Button onClick={onConfirm} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                        {isLoading ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- Helper: Edit Menu Item Modal ---
const EditMenuItemModal = ({ isOpen, onClose, item, categories, onSaveSuccess }) => {
    const restaurantName = useSelector((state) => state.ownerDetailsSlice.restaurantName);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', isVegetarian: false, categoryEncryptedId: '' });
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (item) {
            const category = categories.find(c => c.name === item.categoryName);
            setFormData({
                name: item.name,
                description: item.description,
                price: item.price,
                isVegetarian: item.vegetarian,
                categoryEncryptedId: category ? category.encryptedId : ''
            });
        }
    }, [item, categories]);

    const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
        // For checkboxes, the new value is in the 'checked' property
        setFormData(prev => ({ 
            ...prev, 
            [name]: checked 
        }));
    } else {
        // For all other inputs (text, number, textarea, etc.), the new value is in the 'value' property
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    }
};

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setProgress(0);

        
        try {
            
            const payload = {
                name: formData.name,
                description: formData.description,
                price: Number.parseFloat(formData.price),
                isVegetarian: formData.isVegetarian,
                categoryEncryptedId: formData.categoryEncryptedId,
                imageFile: imageFile ? imageFile : null
            };

            console.log('Payload for update:', payload);
            
            // Simplified API call
            await axiosOwnerInstance.put(`/menu/update/${item.encryptedId}`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            toast.success("Item updated successfully!");
            onSaveSuccess();
            onClose();
        } catch (err) {
            const errorMessage = err?.response?.data?.message || "Failed to update item.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg m-4">
                <h2 className="text-xl font-bold mb-6">Edit Menu Item</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Item Name" className="flex-1 bg-black/70 border border-gray-700 rounded-lg p-2.5" required />
                        <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" className="w-28 bg-black/70 border border-gray-700 rounded-lg p-2.5" required />
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Item description..." rows="3" className="w-full bg-black/70 border border-gray-700 rounded-lg p-2.5"></textarea>
                    <div className="flex gap-4 items-center">
                        <select name="categoryEncryptedId" value={formData.categoryEncryptedId} onChange={handleChange} className="flex-1 bg-black/70 border border-gray-700 rounded-lg p-2.5" required>
                            <option value="">Select a Category</option>
                            {categories.map(cat => <option key={cat.encryptedId} value={cat.encryptedId}>{cat.name}</option>)}
                        </select>
                        <label className="flex items-center gap-2"><input type="checkbox" name="isVegetarian" checked={formData.isVegetarian} onChange={handleChange} /> Vegetarian</label>
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500/10 file:text-yellow-300 hover:file:bg-yellow-500/20"/>
                    {isLoading && imageFile && <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div></div>}
                    {error && <p className="text-red-400">{error}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">{isLoading ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Detail Page Component ---
function MenuItemDetailPage() {
    const { menuItemEncryptedId } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Simplified API calls without headers
            const [itemResponse, categoriesResponse] = await Promise.all([
                axiosOwnerInstance.get(`/menu/fetch/${menuItemEncryptedId}`),
                axiosOwnerInstance.post('/category/fetch-list', { pageNo: 0, size: 100 })
            ]);
            setItem(itemResponse.data);
            setCategories(categoriesResponse.data.content || []);
        } catch (err) {
            setError("Failed to load menu item details.");
        } finally {
            setIsLoading(false);
        }
    }, [menuItemEncryptedId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggleAvailability = async () => {
        try {
            // Simplified API call
            await axiosOwnerInstance.patch(`/menu/update-availability/${menuItemEncryptedId}`, { isAvailable: !item.available });
            toast.success(`'${item.name}' is now ${!item.available ? 'available' : 'unavailable'}.`);
            fetchData();
        } catch (err) {
            toast.error("Failed to update status.");
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Simplified API call
            await axiosOwnerInstance.delete(`/menu/delete/${menuItemEncryptedId}`);
            toast.success(`'${item.name}' has been deleted.`);
            navigate('/owner/menu');
        } catch (err) {
            toast.error("Failed to delete item.");
        } finally {
            setIsDeleting(false);
        }
    };
    
    if (isLoading) return <div className="p-10 text-center text-white">Loading...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!item) return <div className="p-10 text-center text-white">Menu item not found.</div>;

    return (
        <div className="container mx-auto p-4 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-bold">{item.name}</h1>
                    <p className="text-lg text-yellow-400 font-semibold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsEditModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"><Edit size={16}/> Edit</Button>
                    <Button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"><Trash size={16}/> Delete</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <img src={item.imageUrl || 'https://via.placeholder.com/300'} alt={item.name} className="w-full h-auto rounded-xl object-cover aspect-square"/>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-400 mb-2">Description</h3>
                        <p>{item.description || 'No description available.'}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
                            <h3 className="font-semibold text-gray-400 mb-2">Category</h3>
                            <p className="font-bold">{item.categoryName}</p>
                        </div>
                         <div className="bg-black/50 border border-gray-800 rounded-xl p-6 flex items-center gap-3">
                             {item.vegetarian ? <Leaf className="text-green-400"/> : <Drumstick className="text-orange-400"/>}
                            <p className="font-bold">{item.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}</p>
                        </div>
                    </div>
                    
                    <div className="bg-black/50 border border-gray-800 rounded-xl p-6 flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-gray-400">Availability</h3>
                            <p className={`font-bold text-lg ${item.available ? 'text-green-400' : 'text-red-400'}`}>{item.available ? 'Currently Available' : 'Currently Unavailable'}</p>
                        </div>
                        <Button onClick={handleToggleAvailability} className="bg-transparent text-white p-2">
                            {item.available ? <ToggleRight size={32} className="text-green-400"/> : <ToggleLeft size={32} className="text-gray-500"/>}
                        </Button>
                    </div>
                </div>
            </div>
            
            <EditMenuItemModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                item={item}
                categories={categories}
                onSaveSuccess={fetchData}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the item "${item.name}"? This action cannot be undone.`}
            />
        </div>
    );
}

export default MenuItemDetailPage;

