import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import adminBackground from '../../assets/adminBackground.jpg';
import { Button } from '../ui/button';
import { axiosSignupInstance } from '../../axios/instances/axiosInstances';
import { setAllowOtp, setSignupOption, setOtpEmail } from '../../redux/slice/signupOptionSlice';
import { setAdminPageAccess } from '../../redux/slice/specialPermissions';
import toast from 'react-hot-toast';

function AdminSignup() {
 
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const adminCode = useSelector((state) => state.adminSignup.adminDetails.code);
   const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    securityCode: adminCode || '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/.test(password)) {
      return 'Password must be 8–20 characters, include at least one number and one symbol';
    }
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) {
      return 'Confirm password is required';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone Number validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Confirm Password validation
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }


    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // District validation
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    // Pincode validation
    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleinputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation for password and confirmPassword
    if (name === 'password') {
      const passwordError = validatePassword(value);
      setErrors((prev) => ({
        ...prev,
        password: passwordError,
        // Re-validate confirmPassword if password changes
        confirmPassword: formData.confirmPassword
          ? validateConfirmPassword(formData.confirmPassword, value)
          : prev.confirmPassword,
      }));
    } else if (name === 'confirmPassword') {
      const confirmPasswordError = validateConfirmPassword(value, formData.password);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordError,
      }));
    } else {
      // Clear error for other fields
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosSignupInstance.post('/admin', {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        address: formData.address,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        securityCode: formData.securityCode,
      });

      console.log('Response:', response);
      if (response.data === true) {
       
       toast.success('Registration successful! Please verify your OTP.');
        await dispatch(setOtpEmail(formData.email)); 
        await dispatch(setAllowOtp(true));
        navigate('/otpVerification');
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Error registering admin:', error);
      setErrors({
        general:
          error.response?.data?.message ||
          'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    dispatch(setSignupOption(option));
    dispatch(setAdminPageAccess(false))

  };

  return (
    <>
      <div
        className="grid grid-cols-1 md:grid-cols-2 w-full h-screen m-0 p-0 bg-cover"
        style={{ backgroundImage: `url(${adminBackground})` }}
      >
        <div className="bg-black/70 overflow-scroll p-8 min-h-screen hide-scrollbar">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl text-white font-bold text-center mt-4">
              Admin Registration
            </h1>
            {errors.general && (
              <p className="text-red-500 text-center mt-4">{errors.general}</p>
            )}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-white">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="name"
                  value={formData.name}
                  onChange={handleinputChange}
                  className="p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-transparent"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleinputChange}
                  className="p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-transparent"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleinputChange}
                  className="p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-transparent"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white">Password</label>
                <div className="relative p-2 rounded-md text-white border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-transparent group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter Password"
                    value={formData.password}
                    onChange={handleinputChange}
                    className="border-none outline-none w-3/4 bg-transparent focus:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-amber-500 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                  <style jsx>{`
                    .group:has(input:focus) {
                      border-color: #f59e0b; /* Tailwind's amber-500 */
                      ring: 2px;
                      ring-color: #f59e0b; /* Tailwind's amber-500 */
                    }
                  `}</style>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white">Confirm Password</label>
                <div className="relative p-2 rounded-md text-white border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-transparent group">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleinputChange}
                    className="border-none outline-none w-3/4 bg-transparent focus:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-amber-500 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Button>
                  {/* <style jsx>{`
                  .group:has(input:focus) {
                    border-color: #f59e0b; 
                    ring: 2px;
                    ring-color: #f59e0b; 
                  }
                }</style> */}
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white">Security Code</label>
                <input
                  type="text"
                  name="securityCode"
                  placeholder="Security code"
                  value={adminCode}
                  disabled
                  className="p-2 rounded-md text-amber-300 border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-transparent"
                />
                {errors.securityCode && (
                  <p className="text-red-500 text-sm">{errors.securityCode}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white">Address</label>
                <textarea
                  name="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleinputChange}
                  className="p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-transparent"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white">District</label>
                <input
                  type="text"
                  name="district"
                  placeholder="District"
                  value={formData.district}
                  onChange={handleinputChange}
                  className="p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-transparent"
                />
                {errors.district && (
                  <p className="text-red-500 text-sm">{errors.district}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white">State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleinputChange}
                  className="p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-transparent"
                />
                {errors.state && (
                  <p className="text-red-500 text-sm">{errors.state}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleinputChange}
                  className="p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 bg-transparent"
                />
                {errors.pincode && (
                  <p className="text-red-500 text-sm">{errors.pincode}</p>
                )}
              </div>
              <div className="flex items-center justify-between w-full mt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-transparent border border-white text-white p-2 rounded hover:border-amber-500 hover:bg-amber-500 hover:text-black transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </Button>
                <div className="text-center">
                  <h4 className="text-white">
                    Already Registered?{' '}
                    <Link
                      to="/login"
                      className="text-black bg-amber-500 px-4 py-1 rounded hover:bg-white transition duration-300"
                    >
                      Login
                    </Link>
                  </h4>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div
          className="grid grid-cols-1 justify-center items-around"
          style={{
            backgroundImage: `url(${adminBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex flex-col mb-20 mt-4 md:mb-auto md:mt-auto items-center justify-center text-center">
            <p className="text-white text-4xl">Welcome To</p>
            <h1 className="text-white text-5xl">Restauron Admin</h1>
          </div>
          <div className='flex flex-col items-center justify-center text-center'>
            <p className="text-white text-center text-lg mb-4">Go to</p>
            <div className="flex w-full justify-center max-w-lg mb-6 md:mb-auto">
              <button
                onClick={() => handleOptionSelect('restaurant')}
                className="flex-1 px-6 py-4 border-2 transition-all duration-300 ease-in-out focus:outline-none rounded-bl-md rounded-tl-md font-medium text-lg border-white bg-transparent text-white hover:bg-white hover:text-black"
              >
                restaurant
              </button>
              <button
                onClick={() => handleOptionSelect('employee')}
                className="flex-1 px-6 py-4 border-2 transition-all duration-300 ease-in-out focus:outline-none rounded-br-md rounded-tr-md font-medium text-lg border-white bg-transparent text-white hover:bg-white hover:text-black"
              >
                employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSignup;