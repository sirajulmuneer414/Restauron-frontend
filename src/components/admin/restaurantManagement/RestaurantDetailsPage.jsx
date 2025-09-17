import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { axiosAdminInstance } from '../../../axios/instances/axiosInstances';
import { Button } from '../../../components/ui/button';
import CommonLoadingSpinner from '../../../components/loadingAnimations/CommonLoading';
import { Building, Mail, Phone, Shield, User, MapPin, ArrowLeft, Trash2, Lock, Unlock, Edit, AlertTriangle } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

// --- Reusable DetailItem Component ---
const DetailItem = ({ icon: Icon, label, value, isLink = false, to = '#', isStatus = false }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-2">
            <Icon size={14} />{label}
        </label>
        {isStatus ? (
            <span className={`mt-1 px-2.5 py-1 text-xs font-semibold rounded-full border self-start ${
                value === 'ACTIVE' ? 'bg-green-600/20 text-green-300 border-green-700/50' :
                value === 'NONACTIVE' ? 'bg-red-600/20 text-red-300 border-red-700/50' :
                'bg-amber-500/20 text-amber-300 border-amber-600/40'
            }`}>
                {value}
            </span>
        ) : isLink ? (
            <Link to={to} className="text-amber-400 hover:underline">{value || 'N/A'}</Link>
        ) : (
            <p className="text-white text-base">{value || 'Not Provided'}</p>
        )}
    </div>
);

// --- Yup Validation Schema for Edit Modal ---
const EditRestaurantSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').required('Name is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required('Phone is required'),
  address: Yup.string().required('Address is required'),
  district: Yup.string().required('District is required'),
  state: Yup.string().required('State is required'),
  pincode: Yup.string().matches(/^[0-9]{6}$/, 'Must be 6 digits').required('Pincode is required'),
});

// --- Edit Restaurant Modal Component ---
const EditRestaurantModal = ({ restaurant, isOpen, onClose, onSave }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-lg">
                <h3 className="text-2xl font-bold text-yellow-400 mb-6">Edit Restaurant</h3>
                <Formik
                    initialValues={{
                        email: restaurant.email || '',
                        name: restaurant.name || '',
                        phone: restaurant.phone || '',
                        address: restaurant.address || '',
                        district: restaurant.district || '',
                        state: restaurant.state || '',
                        pincode: restaurant.pincode || '',
                    }}
                    validationSchema={EditRestaurantSchema}
                    onSubmit={onSave}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4">
                            <Field name="name" placeholder="Restaurant Name" className="w-full bg-black/50 border border-gray-700 p-2 rounded-md text-white" />
                            <ErrorMessage name="name" component="div" className="text-red-400 text-sm" />
                            
                            <Field name="phone" placeholder="Phone Number" className="w-full bg-black/50 border border-gray-700 p-2 rounded-md text-white" />
                            <ErrorMessage name="phone" component="div" className="text-red-400 text-sm" />
                            
                            <Field name="address" placeholder="Address" className="w-full bg-black/50 border border-gray-700 p-2 rounded-md text-white" />
                            <ErrorMessage name="address" component="div" className="text-red-400 text-sm" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field name="district" placeholder="District" className="w-full bg-black/50 border border-gray-700 p-2 rounded-md text-white" />
                                <Field name="state" placeholder="State" className="w-full bg-black/50 border border-gray-700 p-2 rounded-md text-white" />
                                <Field name="pincode" placeholder="Pincode" className="w-full bg-black/50 border border-gray-700 p-2 rounded-md text-white" />
                            </div>
                             <ErrorMessage name="district" component="div" className="text-red-400 text-sm" />
                             <ErrorMessage name="state" component="div" className="text-red-400 text-sm" />
                             <ErrorMessage name="pincode" component="div" className="text-red-400 text-sm" />

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

// --- Main RestaurantDetailsPage Component ---
const RestaurantDetailsPage = () => {
    const { encryptedId } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosAdminInstance.get(`/restaurants/details/${encryptedId}`);
            setRestaurant(response.data);
        } catch (err) {
            setError("Failed to fetch restaurant details.");
        } finally {
            setIsLoading(false);
        }
    }, [encryptedId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleUpdateStatus = async () => {
        const newStatus = restaurant.status === 'ACTIVE' ? 'block' : 'unblock';
        try {
            await axiosAdminInstance.post(`/restaurants/${newStatus}/${encryptedId}`);
            fetchDetails(); // Refresh data
        } catch (err) {
            toast.error(`Failed to ${newStatus} restaurant.`);
        }
    };
    
    const handleEditSave = async (values, { setSubmitting }) => {
        try {
            await axiosAdminInstance.put(`/restaurants/update/${encryptedId}`, values);
            toast.success("Restaurant details updated successfully.");
            setIsEditModalOpen(false);
            fetchDetails();
        } catch (err) {
            toast.error("Failed to save changes.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axiosAdminInstance.delete(`/restaurants/delete/${encryptedId}`);
            navigate('/admin/restaurants');
        } catch (err) {
            toast.error("Failed to delete restaurant.");
            setIsDeleteModalOpen(false);
        }
    };

    if (isLoading) return <CommonLoadingSpinner />;
    if (error) return <div className="text-center text-red-400 p-10">...Error Display...</div>;
    if (!restaurant) return null;

    const fullAddress = [restaurant.address, restaurant.district, restaurant.state, restaurant.pincode].filter(Boolean).join(', ');

    return (
        <>
            <div className="container mx-auto p-4 text-white">
                <div className="flex items-center justify-between mb-6">
                    <Button onClick={() => navigate(-1)} variant="outline" className="bg-transparent hover:bg-gray-800 border-gray-700">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to List
                    </Button>
                    <div className="flex items-center gap-3">
                        <Button onClick={() => setIsEditModalOpen(true)} className="bg-gray-700 hover:bg-gray-600">
                            <Edit size={16} className="mr-2" /> Edit
                        </Button>
                        <Button onClick={() => setIsDeleteModalOpen(true)} variant="outline" className="bg-red-900/50 border-red-700 text-red-300 hover:bg-red-900">
                            <Trash2 size={16} className="mr-2" /> Delete
                        </Button>
                        <Button onClick={handleUpdateStatus} className="bg-amber-500 text-black hover:bg-amber-600">
                            {restaurant.status === 'ACTIVE' ? <Lock size={16} className="mr-2" /> : <Unlock size={16} className="mr-2" />}
                            {restaurant.status === 'ACTIVE' ? 'Block' : 'Unblock'}
                        </Button>
                    </div>
                </div>

                <div className="bg-gradient-to-b from-black/70 to-black/60 border border-gray-800 rounded-xl shadow-lg">
                    <div className="p-6 border-b border-gray-800 flex items-center gap-4">
                        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center">
                            <Building size={32} className="text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                            <p className="text-gray-400">{restaurant.email}</p>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <DetailItem icon={User} label="Owner" value={restaurant.ownerName} isLink={true} to={`/admin/users/detail/${restaurant.ownerEncryptedUserId}`} />
                        <DetailItem icon={Phone} label="Contact Phone" value={restaurant.phone} />
                        <DetailItem icon={Shield} label="Status" value={restaurant.status} isStatus={true} />
                        <DetailItem icon={MapPin} label="Full Address" value={fullAddress} />
                    </div>
                </div>
            </div>

            <EditRestaurantModal restaurant={restaurant} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleEditSave} />
            
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-red-500/50 rounded-xl p-8 max-w-md w-full">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-white">Delete Restaurant</h3>
                            <p className="mt-2 text-sm text-gray-400">Are you sure? This will permanently delete the restaurant and all its associated data. This action cannot be undone.</p>
                        </div>
                        <div className="mt-6 flex justify-center gap-4">
                            <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">Cancel</Button>
                            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold">Yes, Delete</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RestaurantDetailsPage;

