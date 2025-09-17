import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import table from '../../assets/table.jpg';
import { useDispatch, useSelector } from 'react-redux';
import imageStorage from '../../firebase/firebaseConfig';
import { v4 } from 'uuid';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { setAllowOtp, setSignupOption, setOtpEmail, resetOtpEmail } from '../../redux/slice/signupOptionSlice';
import { axiosSignupInstance } from '../../axios/instances/axiosInstances';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { setAdminPageAccess } from '../../redux/slice/specialPermissions';
import { setAdminCode } from '../../redux/slice/specialValues';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

function RestaurantRegistration() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const restaurantDetails = useSelector((state) => state.ownerSignup?.ownerRestaurant || {});
  const adminPageAccess = useSelector((state) => state.specialPermissions?.adminPageAccess || false);
  const allowOtp = useSelector((state) => state.signupOption?.otp || false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [allowAdminCode, setAllowAdminCode] = useState(false);
  const [adminSecurityCode, setAdminSecurityCode] = useState('');
  const [formData, setFormData] = useState({
    restaurantName: '',
    yourName: '',
    yourEmail: '',
    restaurantEmail: '',
    restaurantPhone: '',
    yourPhone: '',
    password: '',
    confirmPassword: '',
    adhaarNumber: '',
    adhaarImage: null,
    restaurantAddress: '',
    district: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});

  // Debounced email validation
  const validateEmail = useCallback(
    debounce(async (email) => {
      if (!email) {
        setErrors((prev) => ({ ...prev, yourEmail: 'Your Email is required' }));
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setErrors((prev) => ({ ...prev, yourEmail: 'Invalid email format' }));
        return;
      }

      try {

        const response = await axiosSignupInstance.post('/check-email', { email: email, option: 'restaurant' });
        console.log("Email verification response:", response.data)
        if (response.data) {
          setErrors((prev) => ({ ...prev, yourEmail: 'Email already exists' }));
          return;
        } else {
          setErrors((prev) => ({ ...prev, yourEmail: '' }));
        }
      } catch (error) {
        console.error('Error checking email:', error);
        setErrors((prev) => ({ ...prev, yourEmail: 'Error verifying email' }));
      }
    }, 500),
    []
  );

  const handleinputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'yourEmail') {
      validateEmail(value);

    }

    if (name === 'password') {
      if (!value) {
        setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      } else if (value.length < 8 || value.length > 20) {
        setErrors((prev) => ({ ...prev, password: 'Password must be between 8 and 20 characters' }));
      } else if (!/[0-9]/.test(value)) {
        setErrors((prev) => ({ ...prev, password: 'Password must contain at least one number' }));
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        setErrors((prev) => ({ ...prev, password: 'Password must contain at least one special character' }));
      } else {
        setErrors((prev) => ({ ...prev, password: '' }));
      }
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }

    if (name === 'confirmPassword') {
      if (!value) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Confirm Password is required' }));
      } else if (value !== formData.password) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleAdminSecurityCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (!/^[A-Z0-9]*$/.test(value)) {
      setErrors((prev) => ({ ...prev, adminSecurityCode: 'Code must contain only letters and numbers' }));
      return;
    }
    setAdminSecurityCode(value);
    if (value.length !== 20) {
      setErrors((prev) => ({ ...prev, adminSecurityCode: 'The code must be 20 characters' }));
    } else {
      setErrors((prev) => ({ ...prev, adminSecurityCode: '' }));
    }
  };

  const handleAdminSecurityCodeSubmit = async () => {
    if (adminSecurityCode.length !== 20) {
      setErrors((prev) => ({ ...prev, adminSecurityCode: 'The code must be exactly 20 characters' }));
      return;
    }

    try {
      const response = await axiosSignupInstance.post('/admin/verify-code', { code: adminSecurityCode });
      if (response.data === true) {
        console.log('Admin code verified successfully',adminSecurityCode);
        dispatch(setAdminPageAccess(true));
        dispatch(setSignupOption('admin'));
        dispatch(setAdminCode({ code: adminSecurityCode }));
        setErrors((prev) => ({ ...prev, adminSecurityCode: '' }));
  
      } else {
        setErrors((prev) => ({ ...prev, adminSecurityCode: 'Invalid Security Code' }));
      }
    } catch (error) {
      console.error('Error verifying admin code:', error);
      setErrors((prev) => ({ ...prev, adminSecurityCode: 'Error verifying code. Please try again.' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, adhaarImage: file }));
    setErrors((prev) => ({ ...prev, adhaarImage: '' }));
  };

  const handleOptionSelect = (option) => {
    console.log('Selected option:', option);
    try {
      dispatch(setSignupOption(option));
      if (option !== 'admin') {
        dispatch(setAdminPageAccess(false));
      }
    } catch (error) {
      console.error('Error setting signup option:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant Name is required';
    }

    if (!formData.yourName.trim()) {
      newErrors.yourName = 'Your Name is required';
    }

    if (!formData.yourEmail.trim()) {
      newErrors.yourEmail = 'Your Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.yourEmail)) {
      newErrors.yourEmail = 'Invalid email format';
    }

    if (formData.restaurantEmail && !/\S+@\S+\.\S+/.test(formData.restaurantEmail)) {
      newErrors.restaurantEmail = 'Invalid email format';
    }

    if (!formData.restaurantPhone.trim()) {
      newErrors.restaurantPhone = 'Restaurant Phone Number is required';
    } else if (!/^\d{10}$/.test(formData.restaurantPhone)) {
      newErrors.restaurantPhone = 'Phone number must be 10 digits';
    }

    if (formData.yourPhone && !/^\d{10}$/.test(formData.yourPhone)) {
      newErrors.yourPhone = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8 || formData.password.length > 20) {
      newErrors.password = 'Password must be between 8 and 20 characters';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.adhaarNumber.trim()) {
      newErrors.adhaarNumber = 'Aadhaar Number is required';
    } else if (!/^\d{12}$/.test(formData.adhaarNumber)) {
      newErrors.adhaarNumber = 'Aadhaar Number must be 12 digits';
    }

    if (!formData.adhaarImage) {
      newErrors.adhaarImage = 'Aadhaar Image is required';
    } else {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!allowedTypes.includes(formData.adhaarImage.type)) {
        newErrors.adhaarImage = 'File must be JPG, JPEG, or PNG';
      } else if (formData.adhaarImage.size > maxSize) {
        newErrors.adhaarImage = 'File size must be less than 5MB';
      }
    }

    if (!formData.restaurantAddress.trim()) {
      newErrors.restaurantAddress = 'Restaurant Address is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log("In the restaurant details submit");
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    console.log("Validation completed");

    try {
      const adhaarImageRef = ref(imageStorage, `adhaarImages/${v4()}`);
      console.log("Adhaar image uploaded", adhaarImageRef);
      await uploadBytes(adhaarImageRef, formData.adhaarImage);
      const adhaarImageUrl = await getDownloadURL(adhaarImageRef);

      const restaurantRegistrationDetails = {
        name: formData.yourName,
        email: formData.yourEmail,
        phone: formData.yourPhone,
        password: formData.password,
        adhaarNumber: formData.adhaarNumber,
        adhaarPhoto: adhaarImageUrl,
        restaurantName: formData.restaurantName,
        restaurantAddress: formData.restaurantAddress,
        restaurantPhone: formData.restaurantPhone,
        restaurantEmail: formData.restaurantEmail,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
      };

      const response = await axiosSignupInstance.post('/restaurant',restaurantRegistrationDetails );
      if (response.status === 201) {
      await dispatch(setOtpEmail(formData.yourEmail));
        setFormData({
          restaurantName: '',
          yourName: '',
          yourEmail: '',
          restaurantEmail: '',
          restaurantPhone: '',
          yourPhone: '',
          password: '',
          confirmPassword: '',
          adhaarNumber: '',
          adhaarImage: null,
          restaurantAddress: '',
          district: '',
          state: '',
          pincode: '',
        });
        setErrors({});
        await dispatch(setAllowOtp(true));
        navigate('/otpVerification');
      } else {
        setErrors({ general: response.data.message || 'Failed to register restaurant' });
      }
    } catch (error) {
      console.error('Error registering restaurant:', error);
      setErrors({ general: error.response?.data?.message || 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 w-full h-screen m-0 p-0 bg-cover' style={{ backgroundImage: `url(${table})` }}>
      <div className='bg-black/70 overflow-scroll p-8 min-h-screen hide-scrollbar'>
        <div className='max-w-md mx-auto'>
          <h1 className='text-3xl text-white font-bold text-center mt-4'>Restaurant Registration</h1>
          {errors.general && <p className='text-red-500 text-center mt-4'>{errors.general}</p>}
          <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Restaurant Name</label>
              <input
                type='text'
                name='restaurantName'
                placeholder='Restaurant Name'
                value={formData.restaurantName}
                onChange={handleinputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.restaurantName && <p className='text-red-500 text-sm'>{errors.restaurantName}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Your Name</label>
              <input
                type='text'
                name='yourName'
                placeholder='Your Name'
                value={formData.yourName}
                onChange={handleinputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.yourName && <p className='text-red-500 text-sm'>{errors.yourName}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Your Email</label>
              <input
                type='email'
                name='yourEmail'
                placeholder='Your Email'
                value={formData.yourEmail}
                onChange={handleinputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.yourEmail && <p className='text-red-500 text-sm'>{errors.yourEmail}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Restaurant Email (Optional)</label>
              <input
                type='email'
                name='restaurantEmail'
                placeholder='Restaurant Email'
                value={formData.restaurantEmail}
                onChange={handleinputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.restaurantEmail && <p className='text-red-500 text-sm'>{errors.restaurantEmail}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Restaurant Phone Number</label>
              <input
                type='tel'
                name='restaurantPhone'
                placeholder='Restaurant Phone Number'
                value={formData.restaurantPhone}
                onChange={handleinputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.restaurantPhone && <p className='text-red-500 text-sm'>{errors.restaurantPhone}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Your Phone Number (Optional)</label>
              <input
                type='tel'
                name='yourPhone'
                placeholder='Your Phone Number'
                value={formData.yourPhone}
                onChange={handleinputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.yourPhone && <p className='text-red-500 text-sm'>{errors.yourPhone}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Password</label>
              <div className='relative p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  placeholder='Enter Password'
                  value={formData.password}
                  onChange={handleinputChange}
                  className='border-none outline-0 w-3/4'
                />
                <Button
                  type='button'
                  variant='ghost'
                  className='absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-amber-500 hover:bg-transparent'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              </div>
              {errors.password && <p className='text-red-500 text-sm'>{errors.password}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Confirm Password</label>
              <div className='relative p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name='confirmPassword'
                  placeholder='Confirm Password'
                  value={formData.confirmPassword}
                  onChange={handleinputChange}
                  className='border-none outline-0 w-3/4'
                />
                <Button
                  type='button'
                  variant='ghost'
                  className='absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-amber-500 hover:bg-transparent'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Button>
              </div>
              {errors.confirmPassword && <p className='text-red-500 text-sm'>{errors.confirmPassword}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Aadhaar Number</label>
              <input
                type='text'
                name='adhaarNumber'
                placeholder='Aadhaar Number'
                value={formData.adhaarNumber}
                onChange={handleinputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.adhaarNumber && <p className='text-red-500 text-sm'>{errors.adhaarNumber}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Aadhaar Image</label>
              <input
                type='file'
                name='adhaarImage'
                accept='.jpg,.jpeg,.png'
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
                onChange={handleFileChange}
              />
              {errors.adhaarImage && <p className='text-red-500 text-sm'>{errors.adhaarImage}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Restaurant Address</label>
              <textarea
                name='restaurantAddress'
                placeholder='Restaurant Address'
                value={formData.restaurantAddress}
                onChange={handleinputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.restaurantAddress && <p className='text-red-500 text-sm'>{errors.restaurantAddress}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>District</label>
              <input
                type='text'
                name='district'
                placeholder='District'
                value={formData.district}
                onChange={handleinputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.district && <p className='text-red-500 text-sm'>{errors.district}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>State</label>
              <input
                type='text'
                name='state'
                placeholder='State'
                value={formData.state}
                onChange={handleinputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.state && <p className='text-red-500 text-sm'>{errors.state}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Pincode</label>
              <input
                type='text'
                name='pincode'
                placeholder='Pincode'
                value={formData.pincode}
                onChange={handleinputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.pincode && <p className='text-red-500 text-sm'>{errors.pincode}</p>}
            </div>
            <div className='flex items-center justify-between w-full mt-6'>
              <Button
                type='submit'
                disabled={isLoading}
                className='bg-transparent border border-white text-white p-2 rounded hover:border-amber-500 hover:bg-amber-500 hover:text-black transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
              <div className='text-center'>
                <h4 className='text-white'>
                  Already Registered?{' '}
                  <Link to='/login' className='text-black bg-amber-500 px-4 py-1 rounded hover:bg-white transition duration-300'>
                    Login
                  </Link>
                </h4>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className='grid grid-col-1 justify-center items-around' style={{ backgroundImage: `url(${table})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className='flex flex-col mb-20 mt-4 md:mb-auto md:mt-auto items-center justify-center text-center'>
          <p className='text-white text-4xl'>Welcome To</p>
          <h1 className='text-white text-5xl'>Restauron</h1>
        </div>
        <div>
          <div className="flex w-full max-w-lg mb-6 md:mb-auto">
            <button
              onClick={() => handleOptionSelect('restaurant')}
              className={`flex-1 px-6 py-4 border-2 transition-all duration-300 ease-in-out focus:outline-none rounded-tl-md rounded-bl-md font-medium text-lg border-white bg-white text-black`}
            >
              restaurant
            </button>
            <button
              onClick={() => handleOptionSelect('employee')}
              className={`flex-1 px-6 py-4 border-2 transition-all duration-300 ease-in-out focus:outline-none rounded-br-md rounded-tr-md font-medium text-lg border-white bg-transparent text-white hover:bg-white hover:text-black`}
            >
              employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantRegistration;