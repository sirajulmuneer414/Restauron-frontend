import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Axios and UI imports
import { useAxios } from '../../../axios/instances/axiosInstances'; // Assuming an employee-specific instance
import { Button } from '../../ui/button';
import CommonLoadingSpinner from '../../loadingAnimations/CommonLoading';
import { User, Mail, Phone, Edit, ShieldAlert, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// --- Validation Schema for the Edit Form ---
const EditProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
});


const EmployeeProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.userSlice.user);
  const nav = useNavigate();
  const {specialId} = useParams();
  
  // State to control the visibility of the edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const {axiosEmployeeInstance} = useAxios(); // Assuming an employee-specific instance
  // --- Data Fetching ---
    


useEffect(() => {
    const fetchProfileData = async () => {
        setIsLoading(true);
      try {
        // This endpoint should be secured and return the logged-in employee's data
        const response = await axiosEmployeeInstance.get(`/profile/details/${specialId}`);
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to load your profile. Please try again later.');
        console.error('Fetch profile error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if(user && user.userId){
    fetchProfileData();
    } else {
        setIsLoading(false);
        setError('User not authenticated. Please log in again.');
        setTimeout(() =>
        nav('/login')
    , 500)// Redirect to login if user data is missing
    }
  }, []); // Empty dependency array means this runs once on component mount

  // --- Form Submission Handler ---
  const handleUpdateProfile = async (values, { setSubmitting, setErrors }) => {
    setSubmitting(true);
    try {
      // This endpoint should update the logged-in employee's data
      const response = await axiosEmployeeInstance.put(`/profile/update/${specialId}`, values);
      
      // Update the local state with the new data from the server
      setProfileData(response.data);
      setIsEditModalOpen(false); // Close the modal on success
      
    } catch (err) {
      const apiError = err.response?.data?.message || 'An unexpected error occurred.';
      setErrors({ api: apiError });
      console.error('Update profile error:', err);
    } finally {
      setSubmitting(false);
    }
  };


  // --- Render Logic ---
  if (isLoading) {
    return <CommonLoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-white">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }
  
  // A helper component for displaying profile information cleanly
  const InfoField = ({ icon: Icon, label, value }) => (
    <div>
        <label className="text-sm text-gray-400 flex items-center gap-2">
            <Icon size={16} />
            {label}
        </label>
        <p className="text-lg font-semibold text-white mt-1">{value}</p>
    </div>
  );
  
  // Reusable input component for the modal form
  const FormInput = ({ icon: Icon, name, type, placeholder }) => (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
      <Field
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full bg-white/70 border border-gray-700 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30"
      />
      <ErrorMessage name={name} component="div" className="text-red-400 text-sm mt-1 ml-2" />
    </div>
  );

  return (
    <>
      <div className="container mx-auto p-4 md:p-6 text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-gray-400">View and manage your personal details.</p>
            </div>
            <Button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
            >
                <Edit size={16} />
                Edit Profile
            </Button>
        </div>

        {/* Profile Details Display */}
        <div className="bg-black/50 border border-gray-800 rounded-xl p-8 max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center gap-6 md:col-span-2">
                <img
                    src={`https://ui-avatars.com/api/?name=${profileData?.name?.replace(' ', '+') || ''}&background=f59e0b&color=000&size=128`}
                    alt="Profile Avatar"
                    className="w-24 h-24 rounded-full border-4 border-gray-700"
                />
                <div>
                    <h2 className="text-3xl font-bold">{profileData.name}</h2>
                    <p className="text-yellow-400 font-mono">{profileData.email}</p>
                </div>
            </div>
            <InfoField icon={Mail} label="Personal Email" value={profileData.personalEmail} />
            <InfoField icon={Phone} label="Phone Number" value={profileData.phone} />
            <InfoField icon={User} label="Adhaar No" value={profileData.adhaarNo} />
            <div className="md:col-span-2">
                <img
                    src={profileData.adhaarPhoto}
                    alt="Adhaar Document"
                    className="w-full h-auto rounded-lg border border-gray-700"
                />
            </div>
        </div>
      </div>

      {/* --- Edit Profile Modal --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Your Details</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white">
                    <X size={24} />
                </button>
            </div>
            
            <Formik
              initialValues={{
                name: profileData.name,
                phone: profileData.phone,
                personalEmail: profileData.personalEmail,
              }}
              validationSchema={EditProfileSchema}
              onSubmit={handleUpdateProfile}
            >
              {({ isSubmitting, errors }) => (
                <Form className="space-y-6">
                  <FormInput icon={User} name="name" type="text" placeholder="Full Name" />
                  <FormInput icon={Phone} name="phone" type="tel" placeholder="10-digit Phone Number" />
                  <FormInput icon={Mail} name="personalEmail" type="email" placeholder="Personal Email" />
                  
                  {errors.api && <div className="text-red-400 text-center bg-red-900/30 p-3 rounded-lg">{errors.api}</div>}
                  
                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-700">
                    <Button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="bg-transparent hover:bg-gray-800 text-gray-300 font-semibold py-2 px-6 rounded-lg border border-gray-700"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeProfilePage;
