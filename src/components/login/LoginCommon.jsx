
import { Field, Formik } from 'formik';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Link, useNavigate } from 'react-router-dom';
import LogoGolden from '../../assets/logo-golden.png';
import Table from '../../assets/login-back.jpg';
import { axiosLoginInstance } from '../../axios/instances/axiosInstances';
import { setSignupOption } from '../../redux/slice/signupOptionSlice';
import Cookie from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { setUserDetails } from '../../redux/slice/userSlice';
import { setWaitingForApprovalMessage } from '../../redux/slice/specialValues';

function LoginCommon() {
  const signupOption = useSelector((state) => state.signupOption.signupOption);
  const emailFromOtp = useSelector((state) => state.signupOption.otpEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues = () => {
   return {
    email: emailFromOtp || '',
    password: '',
   } 
  };

  const handleResetPassword = () => {
    // Implement reset password logic here
    navigate('/reset-password');
  };

  const handleSignupClick = () => {
    dispatch(setSignupOption('restaurant')); // Default to restaurant signup
    navigate('/');
  };

  return (
    <div
      className="grid grid-cols-1 grid-rows-1 h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${Table})` }}
    >
      {/* Navbar */}
      <nav className="bg-gradient-to-br from-black/70 to-black/60 p-2 flex justify-between items-center border-b border-gray-700/50 h-16">
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

      {/* Main Content */}
      <div className="flex items-center justify-center p-4">
        <div className="bg-black/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">Restauron Login</h1>
            <p className="text-gray-300 mt-2">Access your account dashboard</p>
          </div>
          <Formik
            initialValues={initialValues()}
            validationSchema={Yup.object({
              email: Yup.string().email('Enter a valid email').required('Email is required'),
              password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .max(20, 'Password must be at most 20 characters')
                .required('Password is required'),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              setIsLoading(true);
              setErrorMessage('');
              try {
                const response = await axiosLoginInstance.post('',{
                  email: values.email,
                  password: values.password,
                });

                if (response.status === 200) {
                  const jwtToken = response.data.token;
                  const jwtDecoded = jwtDecode(jwtToken);
                  Cookie.set('jwtToken', jwtToken);
                  dispatch(
                    setUserDetails({
                      name: jwtDecoded.username,
                      email: jwtDecoded.email,
                      role: jwtDecoded.role,
                      userId: jwtDecoded.userId,
                    })
                  );

                  switch (jwtDecoded.role.toLowerCase()) {
                    case 'admin':
                      navigate('/admin/restaurants/requests');
                      break;
                    case 'owner':
                      navigate('/restaurant/employees/requests');
                      break;
                    case 'employee':
                      navigate('/employee/dashboard');
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
                setErrorMessage('Invalid email or . Please try again.');
              } finally {
                setIsLoading(false);
                setSubmitting(false);
              }
            }}
          >
            {({ handleSubmit, handleChange, handleBlur, values, errors, touched, isSubmitting }) => (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-200">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    className="bg-gray-700/50 text-white border-gray-600 focus:border-amber-500 focus:ring-amber-500 rounded-lg p-3 transition duration-200"
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
                <div className="space-y-2 relative">
                  <label htmlFor="password" className="text-sm font-medium text-gray-200">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className="bg-gray-700/50 text-white border-gray-600 focus:border-amber-500 focus:ring-amber-500 rounded-lg p-3 pr-20 transition duration-200"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.password}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-amber-500 hover:bg-transparent"
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
                  className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-amber-600 hover:text-white transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isSubmitting}
                >
                  {isLoading || isSubmitting ? 'Logging In...' : 'Login'}
                </Button>
              </form>
            )}
          </Formik>
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Forgot your password?{' '}
              <button
                className="text-amber-400 hover:underline"
                onClick={handleResetPassword}
              >
                Reset it
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginCommon;
