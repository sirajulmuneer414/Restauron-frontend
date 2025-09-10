import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { axiosPublicInstance } from '../../axios/instances/axiosInstances';
import { Button } from '../../components/ui/button';
import { User, Mail, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import Cookie from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { setUserDetails } from '../../redux/slice/userSlice';
import { useDispatch } from 'react-redux';

const GOOGLE_CLIENT_ID = "152323379317-tilaursisc0rgu4riju2qd4u6jdri3i1.apps.googleusercontent.com";

const SignupSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too short').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const OtpSchema = Yup.object().shape({
  otp: Yup.string().required('OTP is required').length(6, 'Must be 6 digits'),
});

const CustomerAuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { encryptedId } = useParams();
  const dispatch = useDispatch();
  
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Timer logic for resending OTP
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

  const handleAuthSuccess = (token) => {
    Cookie.set('jwtToken', token);

    const jwtToken = token;
    const decodedToken = jwtDecode(token);

    dispatch(setUserDetails({
      name: decodedToken.username,
      email: decodedToken.email,
      role: decodedToken.role,
      userId: decodedToken.userId,
    }))

    navigate(`/restaurant/${encryptedId}/home`);
  };
  
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axiosPublicInstance.post('/auth/google', { token: credentialResponse.credential });
      handleAuthSuccess(response.data.token);
    } catch (error) {
      alert('Google login failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      await axiosPublicInstance.post('/auth/send-otp', { email: registrationData.email });
      setCanResend(false);
      setResendTimer(30); // Reset timer
    } catch (error) {
      alert('Failed to resend OTP. Please try again.');
    }
  };

  const handleFormSubmit = async (values, { setSubmitting, setErrors }) => {
    setErrors({});
    if (activeTab === 'login') {
      try {
        Cookie.remove("jwtToken");
        const response = await axiosPublicInstance.post('/auth/login', values);
        handleAuthSuccess(response.data.token);
      } catch (error) {
        setErrors({ api: error.response?.data?.message || 'Login failed.' });
      }
    } else if (activeTab === 'signup') {
      Cookie.remove("jwtToken");
      if (!isOtpStep) {
        try {
          await axiosPublicInstance.post('/auth/send-otp', { email: values.email });
          setRegistrationData(values);
          setIsOtpStep(true);
          setResendTimer(30); // Start the timer
          setCanResend(false);
        } catch (error) {
          setErrors({ api: error.response?.data?.message || 'Failed to send OTP.' });
        }
      } else {
        const finalPayload = { ...registrationData, otp: values.otp };
        try {
          const response = await axiosPublicInstance.post('/auth/register-verify', finalPayload);
          handleAuthSuccess(response.data.token);
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

  const FormInput = ({ icon: Icon, name, type, placeholder }) => (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
      <Field name={name} type={type} placeholder={placeholder} className="w-full bg-black/70 border border-gray-700 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-yellow-500 text-white" />
      <ErrorMessage name={name} component="div" className="text-red-400 text-sm mt-1 ml-2" />
    </div>
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="w-full max-w-md bg-black/50 border border-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex border-b border-gray-700 mb-6">
            <button onClick={() => handleTabChange('login')} className={`flex-1 py-3 font-semibold ${activeTab === 'login' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}>Login</button>
            <button onClick={() => handleTabChange('signup')} className={`flex-1 py-3 font-semibold ${activeTab === 'signup' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}>Sign Up</button>
          </div>

          <Formik
            initialValues={activeTab === 'login' ? { email: '', password: '' } : (isOtpStep ? { otp: '' } : { name: '', email: '', password: '' })}
            validationSchema={activeTab === 'login' ? LoginSchema : (isOtpStep ? OtpSchema : SignupSchema)}
            onSubmit={handleFormSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors }) => (
              <Form className="space-y-6">
                {activeTab === 'signup' && !isOtpStep && (<><FormInput icon={User} name="name" type="text" placeholder="Full Name" /><FormInput icon={Mail} name="email" type="email" placeholder="Email Address" /><FormInput icon={Lock} name="password" type="password" placeholder="Password" /></>)}
                {activeTab === 'login' && (<><FormInput icon={Mail} name="email" type="email" placeholder="Email Address" /><FormInput icon={Lock} name="password" type="password" placeholder="Password" /></>)}
                {activeTab === 'signup' && isOtpStep && (
                  <div>
                    <p className="text-center text-gray-300 mb-4">An OTP was sent to <strong>{registrationData?.email}</strong>.</p>
                    <FormInput icon={ShieldCheck} name="otp" type="text" placeholder="Enter 6-Digit OTP" />
                    <div className="text-center mt-4">
                      <button type="button" onClick={handleResendOtp} disabled={!canResend} className="text-sm text-yellow-400 disabled:text-gray-500 disabled:cursor-not-allowed hover:underline">
                        {canResend ? (<><span>Resend OTP</span><RefreshCw className="inline-block ml-1 h-3 w-3" /></>) : `Resend in ${resendTimer}s`}
                      </button>
                    </div>
                  </div>
                )}
                {errors.api && <div className="text-red-400 text-center">{errors.api}</div>}
                <Button type="submit" disabled={isSubmitting} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg">
                  {isSubmitting ? 'Processing...' : (activeTab === 'login' ? 'Login' : (isOtpStep ? 'Verify & Create Account' : 'Get OTP'))}
                </Button>
              </Form>
            )}
          </Formik>

          {activeTab === 'login' && (
            <>
              <div className="flex items-center my-6"><hr className="flex-grow border-gray-700" /><span className="px-4 text-gray-500">OR</span><hr className="flex-grow border-gray-700" /></div>
              <div className="flex justify-center"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} theme="outline" size="large" width="350px" /></div>
            </>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default CustomerAuthPage;
