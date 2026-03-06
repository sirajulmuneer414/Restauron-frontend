import React, { useState } from 'react';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookie from 'js-cookie';
import toast from 'react-hot-toast';

// Icons & UI
import { X, Mail, Eye, EyeOff, ArrowRight, UtensilsCrossed, FlaskConical, ShieldCheck, Store, UserCircle } from 'lucide-react';
import { Button } from '../ui/button';

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
  const emailFromOtp = useSelector((state) => state.signupOption.otpEmail);
  const { axiosLoginInstance, axiosInstances } = useAxios();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [isTestingModalOpen, setIsTestingModalOpen] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState(null); // 'owner'|'employee'|'admin'|null

  // ── Demo accounts (credentials never rendered in UI) ──
  const DEMO_ACCOUNTS = {
    owner: { email: 's30050852@gmail.com', password: 'siraj@12345' },
    employee: { email: 'demo@demo.com', password: 'sw9cyevo' }, // placeholder — update later
    admin: { email: 'Admin@restauron.com', password: 'adminOfRestauron123' },
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues = () => ({
    email: emailFromOtp || '',
    password: '',
  });

  const handleSignupClick = () => {
    dispatch(setSignupOption('restaurant'));
    navigate('/signup');
  };

  // ── Shared login logic (used by form + demo buttons) ──
  const quickLogin = async (email, password, demoRole = null) => {
    if (demoRole) setDemoLoadingRole(demoRole);
    else setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await axiosLoginInstance.post('', { email, password });
      if (response.status === 200) {
        const jwtToken = response.data.token;
        const refreshToken = response.data.newRefreshToken;
        const jwtDecoded = jwtDecode(jwtToken);
        Cookie.set('accessToken', jwtToken, { expires: 1 / 48 });
        Cookie.set('refreshToken', refreshToken, { expires: 7 });
        dispatch(setUserDetails({
          name: jwtDecoded.username,
          email: jwtDecoded.email,
          role: jwtDecoded.role,
          userId: jwtDecoded.userId,
          status: jwtDecoded.status,
          restaurantAccessLevel: jwtDecoded.accessLevelStatus,
          restaurantName: jwtDecoded.restaurantName,
        }));
        switch (jwtDecoded.role.toLowerCase()) {
          case 'admin':
            navigate('/admin/restaurant/requests');
            break;
          case 'owner': {
            const ownerResponse = await axiosInstances.get(`/owner/get-restaurant-details/${jwtDecoded.userId}`);
            if (ownerResponse.status === 200) {
              const { restaurantEncryptedId, restaurantName } = ownerResponse.data;
              Cookie.set('restaurantId', restaurantEncryptedId);
              dispatch(setOwnerDetails({ restaurantEncryptedId, restaurantName }));
            }
            navigate('/owner/employees/list');
            break;
          }
          case 'employee': {
            const empResponse = await axiosInstances.get(`/employee/get-restaurant-details/${jwtDecoded.userId}`);
            if (empResponse.status === 200) {
              const { restaurantEncryptedId, restaurantName, specialId } = empResponse.data;
              Cookie.set('restaurantId', restaurantEncryptedId);
              dispatch(setOwnerDetails({ restaurantEncryptedId, restaurantName }));
              dispatch(setSpecialId({ specialId }));
            }
            navigate('/employee/dashboard');
            break;
          }
          default:
            setErrorMessage('Invalid role. Please contact support.');
        }
      } else if (response.status === 202) {
        dispatch(setWaitingForApprovalMessage(response.data));
        navigate('/waiting-for-approval');
      }
    } catch {
      if (demoRole) toast.error(`Demo login failed for ${demoRole}. Credentials may need updating.`);
      else setErrorMessage('Invalid email or password.');
    } finally {
      if (demoRole) setDemoLoadingRole(null);
      else setIsLoading(false);
    }
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { toast.error("Please enter your email"); return; }
    setIsSendingLink(true);
    try {
      await axiosInstances.post('/auth/forgot-password', null, { params: { email: forgotEmail } });
      toast.success("Reset link sent! Check your email.");
      setIsForgotModalOpen(false);
      setForgotEmail('');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || "Failed to send link.";
      toast.error(msg);
    } finally {
      setIsSendingLink(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-black">

      {/* ── LEFT PANEL: Cinematic Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between overflow-hidden">
        {/* Background image with gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${Table})` }}
        />
        {/* Dark overlay — bottom heavy so text pops */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        {/* Subtle yellow glow at the bottom center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-yellow-500/20 blur-3xl rounded-full" />

        {/* Top: Logo */}
        <div className="relative z-10 p-8">
          <img src={LogoGolden} alt="Restauron" className="h-10 w-auto" />
        </div>

        {/* Bottom: Tagline */}
        <div className="relative z-10 p-10 pb-12">
          {/* Decorative pill */}
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5 mb-6">
            <UtensilsCrossed size={14} className="text-yellow-400" />
            <span className="text-yellow-400 text-xs font-semibold tracking-wider uppercase">Restaurant Management Platform</span>
          </div>

          <h2 className="text-5xl xl:text-6xl font-black text-white leading-tight mb-4">
            Run your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
              restaurant
            </span>
            , your<br />way.
          </h2>
          <p className="text-gray-400 text-lg max-w-sm leading-relaxed">
            Orders, menus, staff, and subscriptions : all in one place, built for modern restaurants.
          </p>

          {/* Trust indicators */}
          {/* <div className="flex items-center gap-6 mt-8">
            {[['500+', 'Restaurants'], ['99.9%', 'Uptime'], ['24/7', 'Support']].map(([val, label]) => (
              <div key={label}>
                <p className="text-yellow-400 font-black text-xl">{val}</p>
                <p className="text-gray-500 text-xs">{label}</p>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col bg-gray-950 relative">
        {/* Subtle top edge glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

        {/* Mobile Logo */}
        <div className="lg:hidden p-4 border-b border-gray-800 flex justify-between items-center gap-3">
          <img src={LogoGolden} alt="Restauron" className="h-8 w-auto" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTestingModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-3 py-1.5 rounded-full shadow-md transition-all"
            >
              <FlaskConical size={12} /> For Testing
            </button>
            <button
              onClick={handleSignupClick}
              className="text-sm font-semibold text-yellow-400 border border-yellow-500/40 px-4 py-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Top right — Sign Up + For Testing (desktop) */}
        <div className="hidden lg:flex justify-between items-center px-6 pt-6 pb-4">
          <button
            type="button"
            onClick={() => setIsTestingModalOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2 rounded-full shadow-lg shadow-yellow-500/20 transition-all"
          >
            <FlaskConical size={13} />
            For Testing
          </button>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm">Don't have an account?</span>
            <button
              onClick={handleSignupClick}
              className="text-sm font-semibold text-yellow-400 border border-yellow-500/40 px-4 py-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Centered Form Area */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">

            {/* Heading */}
            <div className="mb-8">
              <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-center mb-5">
                <UtensilsCrossed size={20} className="text-yellow-400" />
              </div>
              <h1 className="text-3xl font-black text-white mb-1">Welcome back</h1>
              <p className="text-gray-500 text-sm">Sign in to your Restauron account</p>
            </div>

            <Formik
              initialValues={initialValues()}
              validationSchema={Yup.object({
                email: Yup.string().email('Enter a valid email').required('Email is required'),
                password: Yup.string().required('Password is required'),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                await quickLogin(values.email, values.password);
                setSubmitting(false);
              }}
            >
              {({ handleSubmit, handleChange, handleBlur, values, errors, touched, isSubmitting }) => (
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Email address</label>
                    <input
                      name="email"
                      type="email"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                      placeholder="name@restaurant.com"
                      autoComplete="email"
                      autoFocus
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                    />
                    {errors.email && touched.email && (
                      <p className="text-red-400 text-xs">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-300">Password</label>
                      <button
                        type="button"
                        className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                        onClick={() => setIsForgotModalOpen(true)}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.password}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && touched.password && (
                      <p className="text-red-400 text-xs">{errors.password}</p>
                    )}
                  </div>

                  {/* Global error */}
                  {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                      {errorMessage}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className="w-full group bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-yellow-500/20"
                  >
                    {isLoading || isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                </form>
              )}
            </Formik>

            {/* Mobile sign up link */}
            <p className="lg:hidden text-center text-gray-600 text-sm mt-6">
              Don't have an account?{' '}
              <button onClick={handleSignupClick} className="text-yellow-400 font-semibold hover:text-yellow-300">
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-700 text-xs py-5 border-t border-gray-800/50">
          © {new Date().getFullYear()} Restauron. All rights reserved.
        </p>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-7 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-center">
                <Mail size={18} className="text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Reset Password</h2>
                <p className="text-xs text-gray-500">We'll email you a reset link</p>
              </div>
            </div>

            <form onSubmit={handleSendResetLink} className="space-y-4">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                placeholder="name@example.com"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSendingLink}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all"
              >
                {isSendingLink ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── FOR TESTING MODAL ── */}
      {isTestingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-7 w-full max-w-sm shadow-2xl relative">
            {/* Close */}
            <button
              onClick={() => setIsTestingModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-center">
                <FlaskConical size={18} className="text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Demo Access</h2>
                <p className="text-xs text-gray-500">Quick login for evaluation</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 border-t border-gray-800 pt-4">
              Click any role below to instantly sign in with a pre-configured demo account.
            </p>

            {/* Role buttons */}
            <div className="flex flex-col gap-3">
              {[
                {
                  role: 'owner',
                  label: 'Login as Owner',
                  desc: 'Full restaurant management access',
                  Icon: Store,
                  color: 'border-yellow-500/40 hover:border-yellow-500 hover:bg-yellow-500/5 text-yellow-400',
                  iconBg: 'bg-yellow-500/10',
                },
                {
                  role: 'employee',
                  label: 'Login as Employee',
                  desc: 'POS, orders & kitchen display',
                  Icon: UserCircle,
                  color: 'border-blue-500/40 hover:border-blue-500 hover:bg-blue-500/5 text-blue-400',
                  iconBg: 'bg-blue-500/10',
                },
                {
                  role: 'admin',
                  label: 'Login as Admin',
                  desc: 'Platform-wide administration',
                  Icon: ShieldCheck,
                  color: 'border-green-500/40 hover:border-green-500 hover:bg-green-500/5 text-green-400',
                  iconBg: 'bg-green-500/10',
                },
              ].map(({ role, label, desc, Icon, color, iconBg }) => (
                <button
                  key={role}
                  disabled={demoLoadingRole !== null}
                  onClick={() => quickLogin(DEMO_ACCOUNTS[role].email, DEMO_ACCOUNTS[role].password, role)}
                  className={`flex items-center gap-4 w-full border rounded-xl px-4 py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    {demoLoadingRole === role ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon size={17} />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  {demoLoadingRole !== role && (
                    <ArrowRight size={15} className="ml-auto opacity-40" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginCommon;
