import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { axiosEmployeeInstance } from '../../../axios/instances/axiosInstances';
import { Button } from '../../ui/button';
import { Lock, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

// Validation schema
const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*\d)/, 'Password must contain at least, one lowercase letter, and one number')
    .required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your new password'),
});

const EmployeeChangePasswordPage = () => {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const user = useSelector((state) => state.userSlice.user);

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setSubmitting(true);
    try {
      await axiosEmployeeInstance.post('/profile/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });

      // Success - show confirmation and redirect
      toast.success('Password updated successfully! Please log in again with your new password.');
      navigate(`/employee/profile/${user.specialId}`);
    } catch (error) {
      const apiError = error.response?.data?.message || 'Failed to update password. Please try again.';
      setErrors({ api: apiError });
    } finally {
      setSubmitting(false);
    }
  };

  // Reusable password input component
  const PasswordInput = ({ name, label, placeholder, showPassword, toggleShow }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <Field
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className="w-full bg-black/70 border border-gray-700 rounded-lg pl-12 pr-12 py-3 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 text-white"
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <ErrorMessage name={name} component="div" className="text-red-400 text-sm mt-1 ml-2" />
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 text-white">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button onClick={() => navigate(-1)} className="bg-gray-800 hover:bg-gray-700 p-2 h-10 w-10 rounded-full">
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="text-yellow-400" size={32} />
            Change Password
          </h1>
          <p className="text-gray-400">Keep your account secure by updating your password regularly.</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto bg-black/50 border border-gray-800 rounded-xl p-8">
        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
          }}
          validationSchema={ChangePasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form className="space-y-6">
              <PasswordInput
                name="currentPassword"
                label="Current Password"
                placeholder="Enter your current password"
                showPassword={showCurrentPassword}
                toggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
              />

              <PasswordInput
                name="newPassword"
                label="New Password"
                placeholder="Enter your new password"
                showPassword={showNewPassword}
                toggleShow={() => setShowNewPassword(!showNewPassword)}
              />

              <PasswordInput
                name="confirmNewPassword"
                label="Confirm New Password"
                placeholder="Confirm your new password"
                showPassword={showConfirmPassword}
                toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              {/* Password Requirements */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-400 mb-2">Password Requirements:</h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                </ul>
              </div>

              {errors.api && (
                <div className="text-red-400 text-center bg-red-900/30 border border-red-800 rounded-lg p-3">
                  {errors.api}
                </div>
              )}

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-700">
                <Button
                  type="button"
                  onClick={() => navigate(-1)}
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
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EmployeeChangePasswordPage;
