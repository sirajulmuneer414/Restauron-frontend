import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAxios } from '../../axios/instances/axiosInstances';
import { Button } from '../../components/ui/button';
import { User, Mail, Lock, ShieldCheck, RefreshCw, Phone, Store } from 'lucide-react';
import PasswordInput from '../../components/ui/PasswordInput';
import Cookie from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { setUserDetails } from '../../redux/slice/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

 // Use 'public' instance for public endpoints

const GOOGLE_CLIENT_ID = "152323379317-tilaursisc0rgu4riju2qd4u6jdri3i1.apps.googleusercontent.com";

const SignupSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too short').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number').required('Phone number is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const OtpSchema = Yup.object().shape({
  otp: Yup.string().required('OTP is required').length(6, 'Must be 6 digits'),
});

// Enhanced FormInput component with better styling
const FormInput = ({ icon: Icon, name, type, placeholder }) => (
  <div className="relative group">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-400 transition-colors" size={20} />
    <Field 
      name={name} 
      type={type} 
      placeholder={placeholder} 
      className="w-full bg-black/70 border border-gray-700 rounded-lg pl-12 pr-4 py-3.5 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-white placeholder-gray-400 transition-all duration-200" 
    />
    <ErrorMessage name={name} component="div" className="text-red-400 text-xs mt-1.5 ml-2 font-medium" />
  </div>
);

const CustomerAuthPage = () => {
  const {axiosPublicInstance} = useAxios();
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { encryptedId } = useParams();
  const dispatch = useDispatch();

  const [isOtpStep, setIsOtpStep] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const restaurantName = useSelector((state) => state.ownerDetailsSlice.restaurantName);


  const handleAuthSuccess = (token, refreshToken, specialId) => {

    Cookie.set('accessToken', token);
    Cookie.set('refreshToken', refreshToken, { expires: 7 }); 
    Cookie.set("customerId",specialId, { expires: 7 });

    const decodedToken = jwtDecode(token);
    dispatch(setUserDetails({
      name: decodedToken.username,
      email: decodedToken.email,
      role: decodedToken.role,
      userId: decodedToken.userId,
      status: decodedToken.status,
    }));
    navigate(`/restaurant/${encryptedId}/home`);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axiosPublicInstance.post('/auth/google', { token: credentialResponse.credential },{
        headers:  { 'X-Restaurant-Id': encryptedId }
      });
      handleAuthSuccess(response.data.token, response.data.refreshToken, response.data.specialId);
    } catch (error) {
      toast.error('Google login failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      await axiosPublicInstance.post('/auth/send-otp', { email: registrationData.email });
      setCanResend(false);
      setResendTimer(30);
    } catch (error) {
      toast.error('Failed to resend OTP.');
    }
  };

  const handleFormSubmit = async (values, { setSubmitting, setErrors }) => {
    setErrors({});
    if (activeTab === 'login') {
      try {
        console.log("In login try");
        const response = await axiosPublicInstance.post('/auth/login', values);
        console.log("Login response:", response);
        Cookie.remove('accessToken');
        Cookie.remove('refreshToken');
        Cookie.remove('customerId');
        console.log("Old cookies removed");
        handleAuthSuccess(response.data.token, response.data.refreshToken, response.data.specialId);
      } catch (error) {
        setErrors({ api: error.response?.data?.message || 'Login failed.' });
      }
    } else {
      if (!isOtpStep) {
        try {
          await axiosPublicInstance.post('/auth/send-otp', { email: values.email });
          setRegistrationData(values);
          setIsOtpStep(true);
          setResendTimer(30);
          setCanResend(false);
        } catch (error) {
          setErrors({ api: error.response?.data?.message || 'Failed to send OTP.' });
        }
      } else {
        const finalPayload = { ...registrationData, otp: values.otp };
        try {
          const response = await axiosPublicInstance.post('/auth/register-verify', finalPayload, {
            headers: { 'X-Restaurant-Id': encryptedId }
          });
          handleAuthSuccess(response.data.token, response.data.refreshToken, response.data.specialId);
        } catch (error) {
          setErrors({ api: error.response?.data?.message || 'OTP verification failed.' });
        }
      }
    }
    setSubmitting(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsOtpStep(false);
    setRegistrationData(null);
    setResendTimer(0);
    setCanResend(false);
  };

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (isOtpStep) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, isOtpStep]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-slate-900 p-7">
        <div className="flex w-full max-w-6xl h-[750px] bg-gray-800/90 rounded-3xl shadow-2xl overflow-hidden border border-gray-700 backdrop-blur-sm">
          
          {/* Left Side - Enhanced Image and Welcome Text */}
          <div 
            className="hidden md:flex w-1/2 bg-cover bg-center p-10 flex-col justify-between relative"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <Store className="text-yellow-400 mr-3" size={32} />
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                  {restaurantName ? restaurantName : 'Loading...'}
                </h1>
              </div>
              <p className="text-white/90 text-lg drop-shadow-md leading-relaxed">
                Join our community for exclusive offers, seamless ordering, and a premium dining experience.
              </p>
              <div className="flex items-center mt-6 space-x-4 text-yellow-200/80">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <span className="text-sm">Fast & Secure</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <span className="text-sm">Exclusive Deals</span>
                </div>
              </div>
            </div>
            <div className="relative z-10 text-yellow-200/60 text-sm font-medium">
              &copy; 2025 Restauron
            </div>
          </div>

          {/* Right Side - Enhanced Form */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-gray-900/50">
            
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome to {restaurantName ? restaurantName : 'our Restaurant'}
              </h2>
              <p className="text-gray-400 text-sm">
                {activeTab === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-800/50 rounded-xl p-1 mb-8 border border-gray-700">
              <button 
                onClick={() => handleTabChange('login')} 
                className={`flex-1 py-3 px-4 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'login' 
                    ? 'bg-yellow-400 text-black shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Login
              </button>
              <button 
                onClick={() => handleTabChange('signup')} 
                className={`flex-1 py-3 px-4 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'signup' 
                    ? 'bg-yellow-400 text-black shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Sign Up
              </button>
            </div>

            <Formik
              initialValues={activeTab === 'login' ? { email: '', password: '' } : (isOtpStep ? { otp: '' } : { name: '', email: '', phone: '', password: '', confirmPassword: '' })}
              validationSchema={activeTab === 'login' ? LoginSchema : (isOtpStep ? OtpSchema : SignupSchema)}
              onSubmit={handleFormSubmit}
              enableReinitialize
            >
              {({ isSubmitting, errors }) => (
                <Form className="space-y-5">
                  {activeTab === 'signup' && !isOtpStep && (
                    <>
                      <FormInput icon={User} name="name" type="text" placeholder="Full Name" />
                      <FormInput icon={Mail} name="email" type="email" placeholder="Email Address" />
                      <FormInput icon={Phone} name="phone" type="tel" placeholder="Phone Number" />
                      <PasswordInput name="password" placeholder="Password" />
                      <PasswordInput name="confirmPassword" placeholder="Confirm Password" />
                    </>
                  )}
                  
                  {activeTab === 'login' && (
                    <>
                      <FormInput icon={Mail} name="email" type="email" placeholder="Email Address" />
                      <PasswordInput name="password" placeholder="Password" />
                    </>
                  )}
                  
                  {activeTab === 'signup' && isOtpStep && (
                    <div className="text-center">
                      <div className="mb-6 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                        <ShieldCheck className="mx-auto text-yellow-400 mb-2" size={24} />
                        <p className="text-gray-300 text-sm">
                          We've sent a verification code to
                        </p>
                        <p className="text-white font-semibold">{registrationData?.email}</p>
                      </div>
                      <FormInput icon={ShieldCheck} name="otp" type="text" placeholder="Enter 6-Digit OTP" />
                      <div className="mt-4">
                        <button 
                          type="button" 
                          onClick={handleResendOtp} 
                          disabled={!canResend} 
                          className="text-sm text-yellow-400 disabled:text-gray-500 hover:underline disabled:cursor-not-allowed transition-colors flex items-center justify-center mx-auto"
                        >
                          {canResend ? (
                            <>
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Resend OTP
                            </>
                          ) : (
                            `Resend in ${resendTimer}s`
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {errors.api && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-center text-sm font-medium">{errors.api}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3.5 rounded-lg mt-6 shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="animate-spin mr-2" size={16} />
                        Processing...
                      </div>
                    ) : (
                      activeTab === 'login' ? 'Sign In' : (isOtpStep ? 'Verify & Create Account' : 'Get Verification Code')
                    )}
                  </Button>
                </Form>
              )}
            </Formik>

            {activeTab === 'login' && (
              <>
                <div className="flex items-center my-6">
                  <hr className="flex-grow border-gray-700" />
                  <span className="px-4 text-gray-500 text-sm font-medium">OR CONTINUE WITH</span>
                  <hr className="flex-grow border-gray-700" />
                </div>
                <div className="flex justify-center">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess} 
                    onError={() => toast.error('Google Login Failed')} 
                    theme="filled_blue"
                    shape="rectangular"
                    size="large" 
                    width="280"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default CustomerAuthPage;

