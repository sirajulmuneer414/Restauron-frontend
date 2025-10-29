import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAxios } from '../../../axios/instances/axiosInstances';
import { Button } from '../../../components/ui/button';
import CommonLoadingSpinner from '../../../components/loadingAnimations/CommonLoading';
import { User, Mail, Phone, Shield, BarChart, Tag, ArrowLeft, Trash2, Lock, Unlock, Edit, AlertTriangle } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

// --- Reusable DetailItem Component ---
const DetailItem = ({ icon: Icon, label, value, isStatus = false }) => (
  <div className="flex flex-col">
    <label className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-2">
      <Icon size={14} />
      {label}
    </label>
    {isStatus ? (
      <span className={`mt-1 px-2.5 py-1 text-xs font-semibold rounded-full border self-start ${
        value === 'ACTIVE' ? 'bg-green-600/20 text-green-300 border-green-700/50' :
        value === 'NONACTIVE' ? 'bg-red-600/20 text-red-300 border-red-700/50' :
        'bg-amber-500/20 text-amber-300 border-amber-600/40'
      }`}>
        {value}
      </span>
    ) : (
      <p className="text-white text-base">{value || 'Not Provided'}</p>
    )}
  </div>
);

// --- Edit User Modal ---
const EditUserModal = ({ user, isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-md text-white">
        <h3 className="text-xl font-bold mb-6 text-yellow-400">Edit User Details</h3>
        <Formik
          initialValues={{ name: user.name || '', phone: user.phone || '' }}
          validationSchema={Yup.object({
            name: Yup.string().min(2, 'Name is too short').required('Name is required'),
            phone: Yup.string().matches(/^[0-9]{10}$/, 'Must be a 10-digit phone number').nullable(),
          })}
          onSubmit={onSave}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <Field name="name" className="w-full bg-black/50 border border-gray-600 rounded-md p-2" />
                <ErrorMessage name="name" component="div" className="text-red-400 text-xs mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1">Phone</label>
                <Field name="phone" className="w-full bg-black/50 border border-gray-600 rounded-md p-2" />
                <ErrorMessage name="phone" component="div" className="text-red-400 text-xs mt-1" />
              </div>
              <div className="pt-4 flex justify-end gap-4">
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

// --- Main UserDetailsPage Component ---
const UserDetailsPage = () => {
  const { userEncryptionId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const {axiosAdminInstance} = useAxios();
  // --- Data Fetching ---
  const fetchUserDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosAdminInstance.get(`/users/details/${userEncryptionId}`);
      setUser(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch user details.");
    } finally {
      setIsLoading(false);
    }
  }, [userEncryptionId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // --- Action Handlers ---
  const handleUpdateStatus = async () => {
    const newStatus = user.status === 'ACTIVE' ? 'block' : 'unblock';
    try {
      await axiosAdminInstance.post(`/users/${newStatus}/${userEncryptionId}`);
      fetchUserDetails(); // Refresh data on success
    } catch (err) {
      toast.error(`Failed to ${newStatus} user.`);
    }
  };

  const handleEditSave = async (values, { setSubmitting }) => {
    try {
      await axiosAdminInstance.put(`/users/update/${userEncryptionId}`, values);
      setIsEditModalOpen(false);
      fetchUserDetails(); // Refresh data on success
    } catch (err) {
      toast.error("Failed to update user details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosAdminInstance.delete(`/users/delete/${userEncryptionId}`);
      navigate('/admin/users'); // Navigate back to list on success
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  // --- Render Logic ---
  if (isLoading) return <CommonLoadingSpinner />;
  if (error) return (
    <div className="text-center text-red-400 p-10">
      <h2 className="text-xl font-bold">Error</h2>
      <p>{error}</p>
      <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
    </div>
  );
  if (!user) return null;

  return (
    <>
      <div className="container mx-auto p-4 text-white">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => navigate(-1)} variant="outline" className="bg-transparent hover:bg-gray-800 border-gray-700">
            <ArrowLeft size={16} className="mr-2" />
            Back to User List
          </Button>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsEditModalOpen(true)} className="bg-gray-700 hover:bg-gray-600">
              <Edit size={16} className="mr-2" /> Edit
            </Button>
            <Button onClick={() => setIsDeleteModalOpen(true)} variant="outline" className="bg-red-900/50 border-red-700 text-red-300 hover:bg-red-900">
              <Trash2 size={16} className="mr-2" /> Delete
            </Button>
            <Button onClick={handleUpdateStatus} className="bg-amber-500 text-black hover:bg-amber-600">
              {user.status === 'ACTIVE' ? <Lock size={16} className="mr-2" /> : <Unlock size={16} className="mr-2" />}
              {user.status === 'ACTIVE' ? 'Block User' : 'Unblock User'}
            </Button>
          </div>
        </div>
        <div className="bg-gradient-to-b from-black/70 to-black/60 border border-gray-800 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-800 flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center">
              <User size={32} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DetailItem icon={Tag} label="Role" value={user.role} />
            <DetailItem icon={Phone} label="Phone Number" value={user.phone} />
            <DetailItem icon={Shield} label="Account Status" value={user.status} isStatus={true} />
            {user.restaurantName && (
              <DetailItem icon={BarChart} label="Associated Restaurant" value={user.restaurantName} />
            )}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <EditUserModal user={user} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleEditSave} />
      
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-500/50 rounded-xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">Delete User</h3>
              <p className="mt-2 text-sm text-gray-400">Are you sure you want to delete this user? This action cannot be undone.</p>
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

export default UserDetailsPage;

