import { useState } from 'react';
import { Link } from 'react-router-dom';
import table from '../../assets/staff.jpg'; // Adjust path as needed
import { useDispatch } from 'react-redux';
import imageStorage from '../../firebase/firebaseConfig';
import { v4 } from 'uuid';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { setSignupOption } from '../../redux/slice/signupOptionSlice';
import { Button } from "@/components/ui/button";

function EmployeeSignup() {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    restaurantName: '',
    restaurantCode: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    adhaarNumber: '',
    adhaarImage: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
  });

  // Error state for validation
  const [errors, setErrors] = useState({});

  // Handle option select
  const handleOptionSelect = (option) => {
    dispatch(setSignupOption(option));
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, adhaarImage: file }));
    setErrors((prev) => ({ ...prev, adhaarImage: '' }));
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Restaurant Name
    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant Name is required';
    }

    // Restaurant Code
    if (!formData.restaurantCode.trim()) {
      newErrors.restaurantCode = 'Restaurant Code is required';
    }

    // Name
    if (!formData.name.trim()) {
      newErrors.name = 'Your Name is required';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Your Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8 || formData.password.length > 20) {
      newErrors.password = 'Password must be between 8 and 20 characters';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Aadhaar Number
    if (!formData.adhaarNumber.trim()) {
      newErrors.adhaarNumber = 'Aadhaar Number is required';
    } else if (!/^\d{12}$/.test(formData.adhaarNumber)) {
      newErrors.adhaarNumber = 'Aadhaar Number must be 12 digits';
    }

    // Aadhaar Image
    if (!formData.adhaarImage) {
      newErrors.adhaarImage = 'Aadhaar Image is required';
    } else {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!allowedTypes.includes(formData.adhaarImage.type)) {
        newErrors.adhaarImage = 'File must be JPG, JPEG, PNG, or PDF';
      } else if (formData.adhaarImage.size > maxSize) {
        newErrors.adhaarImage = 'File size must be less than 5MB';
      }
    }

    // Address
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // District
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    // State
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    // Pincode
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    console.log('Form submitted with data:', formData);
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const adhaarImageRef = ref(imageStorage, `adhaarImages/${v4()}`);
    await uploadBytes(adhaarImageRef, formData.adhaarImage);
    const adhaarImageUrl = await getDownloadURL(adhaarImageRef);

    const form = {
      restaurantName: formData.restaurantName,
      restaurantCode: formData.restaurantCode,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      adhaarNumber: formData.adhaarNumber,
      adhaarImage: adhaarImageUrl,
      address: formData.address,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode,
    };

    try {
      const response = await fetch('http://localhost:8080/registration/employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        console.log('Employee registered successfully!');
        setFormData({
          restaurantName: '',
          restaurantCode: '',
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          adhaarNumber: '',
          adhaarImage: '',
          address: '',
          district: '',
          state: '',
          pincode: '',
        });
        setErrors({});
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Failed to register employee' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 w-full h-screen m-0 p-0 bg-cover' style={{ backgroundImage: `url(${table})` }}>
      <div className='bg-black/70 overflow-scroll p-8 min-h-screen hide-scrollbar'>
        <div className='max-w-md mx-auto'>
          <h1 className='text-3xl text-white font-bold text-center mt-4'>Employee Registration</h1>
          {errors.general && <p className='text-red-500 text-center mt-4'>{errors.general}</p>}
          <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Restaurant Name</label>
              <input
                type='text'
                name='restaurantName'
                placeholder='Restaurant Name'
                value={formData.restaurantName}
                onChange={handleInputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.restaurantName && <p className='text-red-500 text-sm'>{errors.restaurantName}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Restaurant Code</label>
              <input
                type='text'
                name='restaurantCode'
                placeholder='Restaurant Code'
                value={formData.restaurantCode}
                onChange={handleInputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.restaurantCode && <p className='text-red-500 text-sm'>{errors.restaurantCode}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Your Name</label>
              <input
                type='text'
                name='name'
                placeholder='Your Name'
                value={formData.name}
                onChange={handleInputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.name && <p className='text-red-500 text-sm'>{errors.name}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Your Email</label>
              <input
                type='email'
                name='email'
                placeholder='Your Email'
                value={formData.email}
                onChange={handleInputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Your Phone Number</label>
              <input
                type='tel'
                name='phone'
                placeholder='Your Phone Number'
                value={formData.phone}
                onChange={handleInputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.phone && <p className='text-red-500 text-sm'>{errors.phone}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Password</label>
              <div className='relative p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  placeholder='Enter Password'
                  value={formData.password}
                  onChange={handleInputChange}
                  className='border-none w-3/4 outline-0'
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
                  onChange={handleInputChange}
                  className='border-none w-3/4 outline-0'
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
                onChange={handleInputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.adhaarNumber && <p className='text-red-500 text-sm'>{errors.adhaarNumber}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Aadhaar Image</label>
              <input
                type='file'
                name='adhaarImage'
                accept='.jpg,.jpeg,.png,.pdf'
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
                onChange={handleFileChange}
              />
              {errors.adhaarImage && <p className='text-red-500 text-sm'>{errors.adhaarImage}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>Your Address</label>
              <textarea
                name='address'
                placeholder='Your Address'
                value={formData.address}
                onChange={handleInputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.address && <p className='text-red-500 text-sm'>{errors.address}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-white'>District</label>
              <input
                type='text'
                name='district'
                placeholder='District'
                value={formData.district}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                className='p-2 rounded-md text-white border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
              />
              {errors.pincode && <p className='text-red-500 text-sm'>{errors.pincode}</p>}
            </div>
            <div className='flex items-center justify-between w-full mt-6'>
              <Button
                type='submit'
                className='bg-transparent border border-white text-white p-2 rounded hover:border-amber-500 hover:bg-amber-500 hover:text-black transition duration-300'
              >
                Register
              </Button>
              <div className='text-center'>
                <h4 className='text-white'>
                  Already Registered?{' '}
                  <Link to='/' className='text-black bg-amber-500 px-4 py-1 rounded hover:bg-white transition duration-300'>
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
          <h1 className='text-white text-5xl'> Restauron</h1>
        </div>
        <div>

          <div className="flex w-full max-w-lg mb-6 md:mb-auto">
            {/* Restaurant Button */}
            <button
              onClick={() => handleOptionSelect('restaurant')}
              className={`flex-1 px-6 py-4 border-2 transition-all duration-300 ease-in-out focus:outline-none rounded-bl-md rounded-tl-md font-medium text-lg border-white bg-transparent text-white hover:bg-white hover:text-black  `}
            >
              restaurant
            </button>

            {/* Employee Button */}
            <button 
              onClick={() => handleOptionSelect('employee')}
              className={`flex-1 px-6 py-4 border-2 transition-all duration-300 ease-in-out focus:outline-none rounded-tr-md rounded-br-md font-medium text-lg border-white bg-white text-black`}
            >
              employee
            </button>
          </div>
        </div>


      </div>
    </div>
  );
}

export default EmployeeSignup;