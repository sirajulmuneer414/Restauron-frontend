import React, { useState } from 'react';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookie from 'js-cookie';
import toast from 'react-hot-toast'; 

// Icons & UI
import { X, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

// Assets
import LogoGolden from '../../assets/logo-golden.png';
import Table from '../../assets/login-back.jpg';

// Redux & Services
import { useAxios } from '../../axios/instances/axiosInstances';
import { setSignupOption } from '../../redux/slice/signupOptionSlice';
import { setSpecialId, setUserDetails } from '../../redux/slice/userSlice';
import { setOwnerDetails } from '../../redux/slice/ownerDetailsSlice';
import { setWaitingForApprovalMessage } from '../../redux/slice/specialValues';

function LoginCommon() {
  const signupOption = useSelector((state) => state.signupOption.signupOption);
  const emailFromOtp = useSelector((state) => state.signupOption.otpEmail);
  const { axiosLoginInstance, axiosInstances, axiosPublicInstance } = useAxios();

  // State Management
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues = () => ({
    email: emailFromOtp || '',
    password: '',
  });

  // --- Handlers ---

  const handleSignupClick = () => {
    dispatch(setSignupOption('restaurant')); 
    navigate('/signup');
  };

  const handleSendResetLink = async (e) => {
      e.preventDefault();
      if (!forgotEmail) {
          toast.error("Please enter your email");
          return;
      }
      setIsSendingLink(true);
      try {
          // Calls your backend endpoint: POST /api/auth/forgot-password?email=...
          await axiosInstances.post('/auth/forgot-password', null, { 
              params: { email: forgotEmail } 
          });
          toast.success("Reset link sent! Check your email.");
          setIsForgotModalOpen(false); // Close modal on success
          setForgotEmail('');
      } catch (error) {
          console.error("Forgot PW Error:", error);
          const msg = error.response?.data?.message || error.response?.data || "Failed to send link.";
          toast.error(msg);
      } finally {
          setIsSendingLink(false);
      }
  };

  return (
    <div
      className="grid grid-cols-1 grid-rows-1 h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: `url(${Table})` }}
    >
      {/* Navbar */}
      <nav className="bg-gradient-to-br from-black/70 to-black/60 p-2 flex justify-between items-center border-b border-gray-700/50 h-16 z-10">
        <img src={LogoGolden} alt="Restauron Logo" className="object-contain h-full w-auto" />
        <div>
          <Button
            as={Link}
            onClick={handleSignupClick}
            className="bg-white text-black font-semibold py-1 px-4 rounded-lg hover:bg-amber-500 hover:text-white transition duration-300"
          >
            Sign Up
          </Button>
        </div>
      </nav>

      {/* Main Login Content */}
      <div className="flex items-center justify-center p-4 z-10">
        <div className="bg-black/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">Restauron Login</h1>
            <p className="text-gray-300 mt-2">Access your account dashboard</p>
          </div>
          
          <Formik
            initialValues={initialValues()}
            validationSchema={Yup.object({
              email: Yup.string().email('Enter a valid email').required('Email is required'),
              password: Yup.string().required('Password is required'),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              setIsLoading(true);
              setErrorMessage('');
              try {
                const response = await axiosLoginInstance.post('', {
                  email: values.email,
                  password: values.password,
                });

                if (response.status === 200) {
                  const jwtToken = response.data.token;
                  const refreshToken = response.data.newRefreshToken;
                  const jwtDecoded = jwtDecode(jwtToken);
                  
                  Cookie.set('accessToken', jwtToken, { expires: 1/48 });
                  Cookie.set('refreshToken', refreshToken, { expires: 7 });
                  
                  dispatch(setUserDetails({
                      name: jwtDecoded.username,
                      email: jwtDecoded.email,
                      role: jwtDecoded.role,
                      userId: jwtDecoded.userId,
                      status: jwtDecoded.status,
                  }));

                  // Role-Based Redirects
                  switch (jwtDecoded.role.toLowerCase()) {
                    case 'admin':
                      navigate('/admin/restaurant/requests');
                      break;
                    case 'owner':
                      const ownerResponse = await axiosInstances.get(`/owner/get-restaurant-details/${jwtDecoded.userId}`);
                      if (ownerResponse.status === 200) {
                        const { restaurantEncryptedId, restaurantName } = ownerResponse.data;
                        Cookie.set('restaurantId', restaurantEncryptedId);
                        dispatch(setOwnerDetails({
                          restaurantEncryptedId,
                          restaurantName,
                        }));
                      }
                      navigate('/owner/employees/list');
                      break;
                    case 'employee':
                      const empResponse = await axiosInstances.get(`/employee/get-restaurant-details/${jwtDecoded.userId}`);
                      if (empResponse.status === 200) {
                         const { restaurantEncryptedId, restaurantName, specialId } = empResponse.data;
                        Cookie.set('restaurantId', restaurantEncryptedId);
                        dispatch(setOwnerDetails({
                          restaurantEncryptedId,
                          restaurantName,
                        }));
                        dispatch(setSpecialId({ specialId }));
                        navigate(`/employee/dashboard`); 
                      }
                      break;
                    default:
                      console.error('Unknown role:', jwtDecoded.role);
                      setErrorMessage('Invalid role. Please contact support.');
                  }
                } else if (response.status === 202) {
                  dispatch(setWaitingForApprovalMessage(response.data));
                  navigate('/waiting-for-approval');
                }
              } catch (error) {
                console.error('Login error:', error);
                setErrorMessage('Invalid email or password.');
              } finally {
                setIsLoading(false);
                setSubmitting(false);
              }
            }}
          >
            {({ handleSubmit, handleChange, handleBlur, values, errors, touched, isSubmitting }) => (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-200">Email</label>
                  <Input
                    name="email"
                    type="email"
                    className="bg-gray-700/50 text-white border-gray-600 focus:border-amber-500 rounded-lg p-3"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    placeholder="Enter your email"
                    autoComplete="email"
                    autoFocus
                  />
                  {errors.email && touched.email && (
                    <div className="text-red-400 text-sm">{errors.email}</div>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2 relative">
                  <label htmlFor="password" className="text-sm font-medium text-gray-200">Password</label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className="bg-gray-700/50 text-white border-gray-600 focus:border-amber-500 rounded-lg p-3 pr-20"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.password}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-amber-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  {errors.password && touched.password && (
                    <div className="text-red-400 text-sm">{errors.password}</div>
                  )}
                </div>

                {errorMessage && (
                  <div className="text-red-400 text-sm mt-2">{errorMessage}</div>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-amber-600 hover:text-white transition duration-300 disabled:opacity-50"
                  disabled={isLoading || isSubmitting}
                >
                  {isLoading || isSubmitting ? 'Logging In...' : 'Login'}
                </Button>
              </form>
            )}
          </Formik>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Forgot your password?{' '}
              <button
                className="text-amber-400 hover:underline focus:outline-none"
                onClick={() => setIsForgotModalOpen(true)}
              >
                Reset it
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* --- FORGOT PASSWORD MODAL --- */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <button 
                onClick={() => setIsForgotModalOpen(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                title="Close"
            >
                <X size={20} />
            </button>
            
            <div className="text-center mb-6">
                <div className="bg-amber-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500">
                    <Mail size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">Reset Password</h2>
                <p className="text-sm text-gray-400 mt-1">Enter your email to receive a reset link.</p>
            </div>

            <form onSubmit={handleSendResetLink} className="space-y-4">
                <div>
                    <input 
                        type="email" 
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:border-amber-500 focus:outline-none placeholder-gray-500"
                        placeholder="name@example.com"
                        autoFocus
                    />
                </div>
                <Button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    disabled={isSendingLink}
                >
                    {isSendingLink ? 'Sending...' : 'Send Reset Link'}
                </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginCommon;
