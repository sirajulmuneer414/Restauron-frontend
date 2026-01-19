import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { useAxios } from '../../../axios/instances/axiosInstances';

// UI and Icon imports
import { Button } from '../../ui/button';
import { User, Mail, Phone, CreditCard, UploadCloud, ShieldAlert, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

// --- Validation Schema (No changes needed here) ---
const EditEmployeeSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Name is required'),
  personalEmail: Yup.string().email('Invalid email').required('Personal email is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required('Phone is required'),
  adhaarNo: Yup.string().matches(/^[0-9]{12}$/, 'Must be 12 digits').required('Aadhaar is required'),
  adhaarImageFile: Yup.mixed().nullable()
    .test('fileSize', 'File is too large (max 2MB)', (value) => !value || value.size <= 2 * 1024 * 1024)
    .test('fileType', 'Unsupported file format', (value) => !value || ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)),
});


const EmployeeIndividualDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const {axiosOwnerInstance} = useAxios(); // Assuming an owner-specific instance
  const [employeeData, setEmployeeData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- NEW: State for delete confirmation modal ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const user = useSelector((state) => state.userSlice?.user);
  const isReadOnly = user?.restaurantAccessLevel === 'READ_ONLY';

  // --- Data Fetching (No changes needed) ---
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await axiosOwnerInstance.get(`/employees/detail/${employeeId}`);
        const data = response.data;
        setEmployeeData({
          name: data.name || '',
          personalEmail: data.personalEmail || '',
          companyEmail: data.email || '',
          phone: data.phone || '',
          adhaarNo: data.adhaarNo || '',
          adhaarPhoto: data.adhaarPhoto || '',
          adhaarImageFile: null,
        });
        setImagePreview(data.adhaarPhoto);
      } catch (err) {
        setError('Failed to load employee details.');
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployeeDetails();
  }, [employeeId]);

  // --- Form Submission for Update (No changes needed) ---
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {

    if(isReadOnly) {
      toast.error("Cannot edit employee details in Read-Only mode.");
      setSubmitting(false);
      return; // Prevent action in read-only mode     
    }
    // ... (This function remains the same as before)
    setSubmitting(true);
    setError(null);
    try {
    
      const payload = {
        name: values.name,
        personalEmail: values.personalEmail,
        phone: values.phone,
        adhaarNo: values.adhaarNo,
        adhaarPhoto: values.adhaarImageFile ? values.adhaarImageFile : null,
      };
      await axiosOwnerInstance.put(`/employees/update/${employeeId}`, payload);
      navigate('/owner/employees/list');
    } catch (err) {
      const apiError = err.response?.data?.message || 'An unexpected error occurred.';
      setErrors({ api: apiError });
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // --- NEW: Delete Handler ---
  const handleDelete = async () => {

    if(isReadOnly) {
      toast.error("Cannot delete employee in Read-Only mode.");
      return; // Prevent action in read-only mode     
    }
    setIsDeleting(true);
    setError(null);
    try {
      await axiosOwnerInstance.delete(`/employees/delete/${employeeId}`);
      // On success, close modal and navigate back to the list
      setIsDeleteModalOpen(false);
      navigate('/owner/employees/list');
    } catch (err) {
      setError('Failed to delete employee. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };


  // --- Reusable Form Input Component (No changes needed) ---
  const FormInput = ({ icon: Icon, name, type, placeholder, disabled = false }) => (
      // ... (This component remains the same)
      <div>
        <div className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <Field
                name={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full bg-black/70 border border-gray-700 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
        </div>
        <ErrorMessage name={name} component="div" className="text-red-400 text-sm mt-1 ml-2" />
    </div>
  );

  // --- Render Logic ---
  if (isLoading) {
    return <CommonLoadingSpinner />;
  }

  if (error && !employeeData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-white">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Could Not Load Data</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <Button onClick={() => navigate('/owner/employees/list')} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
          Back to Employee List
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 text-white">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
            <Button onClick={() => navigate(-1)} className="bg-gray-800 hover:bg-gray-700 p-2 h-10 w-10 rounded-full">
                <ArrowLeft />
            </Button>
            <div>
                <h1 className="text-3xl font-bold">Edit Employee Details</h1>
                <p className="text-gray-400">Update the information for <span className="font-semibold text-yellow-400">{employeeData?.name}</span>.</p>
            </div>
        </div>
        
        {employeeData && (
          <Formik
            initialValues={employeeData}
            validationSchema={EditEmployeeSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, setFieldValue }) => (
              <Form className="space-y-6 max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form Fields */}
                <div className="lg:col-span-2 bg-black/50 border border-gray-800 rounded-xl p-8 space-y-6">
                    {/* ... (All form fields remain the same) ... */}
                    <h3 className="text-xl font-bold text-yellow-500 border-b border-gray-700 pb-2">Personal Information</h3>
                    <FormInput icon={User} name="name" type="text" placeholder="Full Name" />
                    <FormInput icon={Mail} name="personalEmail" type="email" placeholder="Personal Email Address" />
                    <FormInput icon={Phone} name="phone" type="tel" placeholder="10-digit Phone Number" />
                    <FormInput icon={CreditCard} name="adhaarNo" type="text" placeholder="12-digit Aadhaar Number" />
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input type="email" value={employeeData.companyEmail} disabled className="w-full bg-black/80 border border-gray-800 rounded-lg pl-12 pr-4 py-3 opacity-60 cursor-not-allowed" />
                    </div>
                </div>

                {/* Right Column: Aadhaar Photo */}
                <div className="bg-black/50 border border-gray-800 rounded-xl p-8">
                    {/* ... (Aadhaar photo section remains the same) ... */}
                    <h3 className="text-xl font-bold text-yellow-500 border-b border-gray-700 pb-2 mb-4">Aadhaar Photo</h3>
                    <div className="space-y-4">
                        <div className="w-full h-48 bg-gray-900/50 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden">
                            {imagePreview ? <img src={imagePreview} alt="Aadhaar Preview" className="w-full h-full object-cover" /> : <p className="text-gray-500">No Image</p>}
                        </div>
                        <input id="adhaarImageFile" name="adhaarImageFile" type="file" accept="image/png, image/jpeg, image/jpg" onChange={(event) => {
                            const file = event.currentTarget.files[0];
                            setFieldValue('adhaarImageFile', file);
                            setImagePreview(file ? URL.createObjectURL(file) : employeeData.adhaarPhoto);
                        }} className="hidden" />
                        <label htmlFor="adhaarImageFile" className="cursor-pointer w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors">
                            <UploadCloud size={20} /> Change Photo
                        </label>
                        <ErrorMessage name="adhaarImageFile" component="div" className="text-red-400 text-sm" />
                    </div>
                </div>

                {/* --- UPDATED: Actions Bar --- */}
                <div className="lg:col-span-3">
                    {errors.api && (
                        <div className="text-red-400 text-center bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4">
                            {errors.api}
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-800">
                        {/* Delete Button on the left */}
                        <Button
                          type="button"
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 font-semibold py-2 px-6 rounded-lg transition-colors"
                          disabled={isSubmitting}
                        >
                          <Trash2 size={16} className="mr-2" /> Delete Employee
                        </Button>

                        {/* Save and Cancel Buttons on the right */}
                        <div className="flex items-center gap-4">
                            <Button type="button" onClick={() => navigate(-1)} className="bg-transparent hover:bg-gray-800 text-gray-300 font-semibold py-2 px-6 rounded-lg border border-gray-700" disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>

      {/* --- NEW: Delete Confirmation Modal --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-500/50 rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">Delete Employee</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-400">
                  Are you sure you want to delete this employee? This action will permanently remove their record and access.
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  This cannot be undone.
                </p>
              </div>
            </div>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            <div className="mt-6 flex justify-center gap-4">
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeIndividualDetails;

